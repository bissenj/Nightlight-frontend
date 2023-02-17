/*
    You and I are probably wondering why there is a '2' version of the getLocationService.js

    Trying some alternate approaches to retrieving location.

    There is an issue where location accuracy can be off by miles when 
    device has no signal.  Unsure at this point if it is the location service of the 
    device (android phone), or if it is the underlying location library (EXPO), and/or 
    if some alternative logic can be used to get an accurate location (see below).

    Location accuracy is generally very good when retrieved from the front end (map screen), 
    made via a single get location call.  Location accuracy is sketchy when retrieved from 
    a background-task, made via a subscription based location service.

    What happens if the front end location call is called from the back-end (instead of subscribing 
    to expo's background locaiton service?)

    Should I dump expo location altogether for another react-native location library?

    One person online said they poll multiple times until a sufficiently accurate location comes back.

    This file is a mess, trying a bunch of stuff to squash the bug.
*/

import * as Location from 'expo-location';
import Geolocation from '@react-native-community/geolocation';

import { writeToLog } from '../database/localLoggingDatabase';

// Constants
locationSubscriptionId = null;

// -------------------------------------------------------------
//  Gets the current gps location of the device.
//  Attempts to use the highest accuracy possible. 
//  Returns an object containing success/failure, message,
//  and location data object.
// -------------------------------------------------------------
export async function getCurrentLocation() {
    let result = { success: false, data: null, message: ''};

    let currentLocation = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true,
        accuracy: Location.Accuracy.BestForNavigation,            
    })
    .then((resp) => {        
        result.success = true;
        result.data = { latitude: resp.coords.latitude, longitude: resp.coords.longitude, elevation: resp.coords.altitude, accuracy: resp.coords.accuracy }        
    })
    .catch((ex) => {
        writeToLog('getLocationService', 'Exception caught in getLocation(): ' + ex, 1);
        result.message = ex;
    });   
    return result; 
}


// -------------------------------------------------------------
//  Returns whether background task is running or not
// -------------------------------------------------------------
export const isLocationTracking = async (LOCATION_TASK_NAME) => {
    const hasStarted = locationSubscriptionId !== null;

    // const hasStarted = await Location.hasStartedLocationUpdatesAsync(
    //     LOCATION_TASK_NAME
    // )
    if (hasStarted) {
      console.log("Background Task is tracking location");      
    }
    else {
      console.log("Background task is not running");
    }
    return hasStarted;
}


// -------------------------------------------------------------
//  Stop location service
// -------------------------------------------------------------
export const stopLocationTracking = async (LOCATION_TASK_NAME) => {
    console.log("stopLocationService()");

    if (locationSubscriptionId !== null) {
        Geolocation.clearWatch(locationSubscriptionId);
        console.log("Location tracking stopped")
    }

    // const hasStarted = await isLocationTracking(LOCATION_TASK_NAME);
    // if (hasStarted) {
    //     await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
    //     console.log("Location tracking stopped")
    // }
}


// -------------------------------------------------------------
//  Check if necessary permissions have been granted
// -------------------------------------------------------------
const hasLocationServicePermissions = async (LOCATION_TASK_NAME) => {
    let result = { success: false, data: null, message: ''};

    // Don't track position if permission is not granted
    const { granted } = await Location.getBackgroundPermissionsAsync()
    if (!granted) {        
        result.message = 'location tracking denied';        
    }
    else {
        result.success = true;
    }    
    return result;
}


// -------------------------------------------------------------
//  Starts location tracking which provides a new location
//  on a configurable basis.
// -------------------------------------------------------------
export const startLocationTracking = async (LOCATION_TASK_NAME, distance = 20, time = 15000) => {
    let result = { success: false, message: ''};

    // Look into using background fetch
    // https://docs.expo.dev/versions/latest/sdk/background-fetch/?redirected



    if (locationSubscriptionId !== null) {
        
        try {
            const watchID = Geolocation.watchPosition(
            (position) => {
                setPosition(JSON.stringify(position));
            },
            (error) => {
                console.error('WatchPosition error: ', JSON.stringify(error));
            }
            );
            locationSubscriptionId = watchID;
            //setSubscriptionId(watchID);
        } catch (error) {            
            console.error('WatchPosition error: ', JSON.stringify(error));
        }         

    }
 
    // Check Permissions
    // const hasPermissions = await hasLocationServicePermissions(LOCATION_TASK_NAME);
    // if (!hasPermissions.success) {
    //     writeToLog('getLocationService', 'Error while starting location tracking, user needs to set permissions. ', 1);
    //     result.message = hasPermissions.message;
    // }

    // Check if service is already running
    // const isRunning = await isLocationTracking(LOCATION_TASK_NAME);
    // if (isRunning) {
    //     writeToLog('getLocationService', 'Location is already tracking.', 1);
    //     result.message = 'Location is already tracking';
    // }


    // Start location tracking
    // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {  
    //     //  https://docs.expo.dev/versions/latest/sdk/location/
    //     enableHighAccuracy: true,          
    //     accuracy: Location.Accuracy.Highest,     //Balanced, //BestForNavigation,           

    //     // PROD:
    //     distanceInterval: distance,             // User Setting    --- 500 meters
    //     //timeInterval: time, // 30000,           // 30 seconds      --- milliseconds
        
    //     // Make sure to enable this notification if you want to consistently track in the background
    //     showsBackgroundLocationIndicator: true,
    //     foregroundService: {
    //         notificationTitle: "Location",
    //         notificationBody: "Nightlight - Location tracking in background",
    //         notificationColor: "#fff",
    //         killServiceOnDestroy: false,
    //     },            
    // })
    // .then(() => {
    //     console.log('getLocationService started');
    //     result.success = true;
    // })  
    // .catch((ex) => {
    //     writeToLog('getLocationService', 'Error while starting location tracking: ' + ex, 1);
    //     result.message = 'Error while starting location tracking: ' + ex;
    // });

    return result;
}