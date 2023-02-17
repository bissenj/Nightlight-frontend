/*
    Generic service which provides location updates for the app.
    Ideally this should act as an interface for the underlying location
    gathering library.  Overall goal is to be able to swap out location libraries
    without the app knowing.

    Public:
        - Request Permissions....TODO [homescreen]
        - Check Permisions...TODO [homescreen]
        
        - isLocationTracking: true/false
        - startLocationTracking: provides location updates on a certain interval
        - stopLocationTracking: stop location updates  
        - getCurrentLocation: get location one time
        - hasLocationServicePermissions: check if user approved necessary permissions

    Types:
        LocationData
            - longitude
            - latitude
            - Elevation (m)
            - Accuracy (m)
            - Speed

*/

import * as Location from 'expo-location';
import { writeToLog } from '../database/localLoggingDatabase';



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
        accuracy: Location.Accuracy.Highest,            
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
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
    )
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

    const hasStarted = await isLocationTracking(LOCATION_TASK_NAME);
    if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
        console.log("Location tracking stopped")
    }
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
//  on a configurable basic
// -------------------------------------------------------------
export const startLocationTracking = async (LOCATION_TASK_NAME, distance = 20, time = 15000) => {
    let result = { success: false, message: ''};
 
    // Check Permissions
    const hasPermissions = await hasLocationServicePermissions(LOCATION_TASK_NAME);
    if (!hasPermissions.success) {
        writeToLog('getLocationService', 'Error while starting location tracking, user needs to set permissions. ', 1);
        result.message = hasPermissions.message;
    }

    // Check if service is already running
    const isRunning = await isLocationTracking(LOCATION_TASK_NAME);
    if (isRunning) {
        writeToLog('getLocationService', 'Location is already tracking.', 1);
        result.message = 'Location is already tracking';
    }


    // Start location tracking
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {  
        //  https://docs.expo.dev/versions/latest/sdk/location/
        enableHighAccuracy: true,          
        accuracy: Location.Accuracy.Highest,     //Balanced, //BestForNavigation,           

        // PROD:
        distanceInterval: distance,             // User Setting    --- 500 meters
        //timeInterval: time, // 30000,           // 30 seconds      --- milliseconds
        
        // Make sure to enable this notification if you want to consistently track in the background
        showsBackgroundLocationIndicator: true,
        foregroundService: {
            notificationTitle: "Location",
            notificationBody: "Nightlight - Location tracking in background",
            notificationColor: "#fff",
            killServiceOnDestroy: false,
        },            
    })
    .then(() => {
        console.log('getLocationService started');
        result.success = true;
    })  
    .catch((ex) => {
        writeToLog('getLocationService', 'Error while starting location tracking: ' + ex, 1);
        result.message = 'Error while starting location tracking: ' + ex;
    });

    return result;
}