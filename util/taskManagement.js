/*
    Creates a task which runs in the background (outside the app).  This
    is used to capture location positions while user is not looking at 
    the app or even has phone in hand.

    If the app is stopped, location tracking (this) should be stopped.

    Bugs:
      In areas with low/no connectivity, the gps accuracy seems
      way off (by miles).

    This code is a bit in-flight as this issue requires some drastic changes
    and experimenting to troubleshoot and overcome.      
*/

// Background Task stuff:  https://chafikgharbi.com/expo-location-tracking/
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from 'expo-background-fetch';
//import * as Location from 'expo-location';

import { convertMilesToMeters } from '../util/calculations';
import { haversineDistance } from '../util/haversine';


import { getCurrentLocation, isLocationTracking, stopLocationTracking, startLocationTracking } from '../services/getLocationService';
import { saveLocationData } from '../services/saveLocationService';
import { syncOfflineData } from '../services/syncLocationService';
import { writeToLog } from '../database/localLoggingDatabase';

const LOCATION_TASK_NAME = "BACKGROUND_LOCATION_TASK"
const BACKGROUND_FETCH_TASK = 'background-fetch'

const NAME = 'background-task';


/// IS THIS COMMENT RELEVANT ANYMORE? @2023
//
// THIS ISN'T WORKING.  
// lOOK FOR MORE IDEAS HERE:  
// https://forums.expo.dev/t/how-to-setstate-from-within-taskmanager/26630/5


/* LOCATION SERVICE - PUB/SUB SOLUTION */
/* PUBLISHER */
const LocationService = () => {
    let subscribers = []
    let location = {
      latitude: 0,
      longitude: 0
    }
    let prevLocation = {
      latitude: 0,
      longitude: 0
    }
    let lifetimeCounter = 500;
    let SAVE_DISTANCE = 409;
  
    return {
      clear: () => {        
        console.log("Clearing list of subscribers");
        subscribers = [];
      },
      subscribe: (sub) => { 
        console.log("Subscribe: ", sub);
        subscribers.push(sub);
        console.log("Location Service list of subscribers is: ", subscribers.length); 
      },
      setLocation: (coords) => {        
        prevLocation = location;    // Save off the old location
        location = coords;
        
        subscribers.forEach((sub) => sub(location));
      },
      unsubscribe: (sub) => {        
        subscribers = subscribers.filter((_sub) => _sub !== sub)
        console.log("Location Service: Unsubscribe ", subscribers.length);
      },
      count: () => {        
        return lifetimeCounter;
      },
      tick: () => {
        return lifetimeCounter--;
      },
      readyToSave: () => {
        
        // Calculate the distance in miles.
        const distance = haversineDistance(location.latitude, location.longitude, prevLocation.latitude, prevLocation.longitude);
        const meters = convertMilesToMeters(distance); 
        let result = false;

        if (meters > SAVE_DISTANCE)
        {
          result = true;
          //console.log("TODO:  Save location now - enough distance has been traveled");          
        }

        return result;        
      },
      setSaveDistance: (dist) => {
        SAVE_DISTANCE = dist;
      }
    }
  }  
export const locationService = LocationService()


// Traditional location task in background
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {    
    console.log("Running task.  Life left: ", locationService.count());

    if (error) {      
      writeToLog(NAME, `Error caught in defineTask: ${error}`, 1);      
      return;
    }
    if (data) {    

      // Extract location coordinates from data
      const { locations } = data;

      // Process locations
      if (locations) {
        locations.map(async (location) => {
          if (location) {                  
            locationService.setLocation(location); 
            writeToLog(NAME, `Got Location - Accuracy: ${location.coords.accuracy.toFixed(2)}`);
                  
            // Save coordinates to offline database                        
            const locationObject = { lat: location.coords.latitude, long: location.coords.longitude, acc: location.coords.accuracy, src: NAME};
            await saveLocationData(locationObject, false)
              .then(async () => {
                // TODO:  Make syncing in the background a setting so we don't drain user's battery.
    
                // Attempt to sync data
                await syncOfflineData()
                  .then(() => {
                    writeToLog(NAME, 'Successfully synced offline data.');
                  })
                  .catch((ex) => {
                    writeToLog(NAME, 'Exception caught while attempting to sync.', 1);
                  });   
              })
              .catch((ex) => {
                writeToLog(NAME, 'Exception caught while attempting to save location.', 1);
              })
          }
        })
      }
    }

    // TODO:  PUT THIS BACK EVENTUALLY?
    // Prevent the background task from running forever.
    // if (locationService.tick() < 0) {
    //   console.log("Kill service");
    //   stopBackgroundUpdate();  
    // }
});

/// https://docs.expo.dev/versions/latest/sdk/background-fetch/?redirected
//
// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();
  console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);

  const location = await getCurrentLocation();
  if (location) {
    console.log('Got location: ', location);
    writeToLog('Background: ', `${JSON.stringify(location.data)}`);
  }

  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// 2. Register the task at some point in your app by providing the same name,
// and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components
async function registerBackgroundFetchAsync() {
  console.log('register task');

  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15, // 15 minutes
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components
async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}


// Start location tracking in background
export const startBackgroundUpdate = async (updateDistance = 500) => {

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (!isRegistered) {
    await registerBackgroundFetchAsync().then(() => {
      BackgroundFetch.setMinimumIntervalAsync(15);
    });
  }

    // Make sure the task is defined otherwise do not start tracking
    // const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME)
    // if (isTaskDefined) {
    //   startLocationTracking(LOCATION_TASK_NAME, updateDistance);
    // }   
    // console.log("Starting Location Background Task - " + updateDistance + " meters");    
}
  

// Stop location tracking in background
export const stopBackgroundUpdate = async () => {

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    }

    console.log("stopBackgroundUpdate()");
    //stopLocationTracking(LOCATION_TASK_NAME);
}

// Return whether background task is running or not
export const isBackgroundTracking = async () => {
    let result = false;
    result = await isLocationTracking(LOCATION_TASK_NAME);
    return result;    
}



