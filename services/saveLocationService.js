/*
    Central logic responsible for attempting to save location data by sending to API 
    and / or storing on offline database if failure.    

    Used by MapScreen, Background Tasks, and Sync Controller.

    20230127 - This is being created to cut down on code duplication in the 
               TaskManager and the Map Screen.  Both need to be able to 
               save location data and handle resulting issues.    
*/

import { writeToLog } from '../database/localLoggingDatabase';
import { addOfflineData } from '../database/localOfflineDatabase';
import { saveLocation } from '../api/fetch';


// ------------------------------------------------------------------------------------
// Summary:  Handles the save location logic for the entire app.  
//           Validates data, optionally sends to API, and in case of 
//           errors (or purposefully not going to api), saves location data to offline 
//           database.
//
// Params:
//           data: { lat, long, accuracy, source -> 'front end' or 'task manager' }
//           sendToApi:  should the data be sent over the network?  
//                       - front end always tries network first (sendToAPI = true)
//                       - task manager is offline first (sendToAPI = false)
// ------------------------------------------------------------------------------------
export async function saveLocationData(data, sendToApi = true, saveOffline = true) {
    let result = { success: false, message: ''};
    let saveToOffline = saveOffline;      // by default assume we are going to save to the offline database

    // Validate the critical data
    result = validateLocationData(data);

    if (result.success = true) {    
        if (sendToApi) {
            // TODO:  Check if Online and sufficient signal
            if (true) {
                // Send to API
                result = await saveLocationByAPI(data);
                console.log('after saveLocationByAPI()', result);
                if (result.success) {                    
                    saveToOffline = false;  // Save was successful, don't need to save offline.
                }
            }
            else { // online + speed check failed                
                // do nothing...by default this is going to drop into the logic below to save to offline.
            }            
        }

        // Store on local database
        if (saveToOffline) {
            result = await saveLocationToOffline(data);
        }
    }   

    return result;
}


// ------------------------------------------------------------------------------------
// Summary:  Basic validation for the latitude and longitude data.
// ------------------------------------------------------------------------------------
function validateLocationData(data) {
    let result = { success: true, message: ''};

    // Validate parameter 1
    if (!data.lat) { 
        result =  { success: false, message: 'lat is missing' };
    } else if (typeof data.lat !== 'number') {
        writeToLog('fetch', 'saveLocation(): lat needs to be a number');        
        result =  { success: false, message: 'lat needs to be a number' };
    }

    // Validate parameter 2
    if (!data.long) { 
        result =  { success: false, message: 'long is missing' };
    } else if (typeof data.long !== 'number') {
        writeToLog('fetch', 'saveLocation(): long needs to be a number');        
        result = { success: false, message: 'long needs to be a number' };
    }

    return result;
}


// ------------------------------------------------------------------------------------
// Summary:  Attempt to save the data over the network (via fetch request).
//           The API will return a success or failure if downstream issues occur.    
//
// Testing:
//          1.  Pass null latitude into saveLocation()
// ------------------------------------------------------------------------------------
async function saveLocationByAPI(data) {
    //console.log('saveLocationByAPI()', data);

    let result = { success: false, message: ''};

     await saveLocation(data.lat, data.long, data.acc, data.src)         
        .then((resp) => {
            result = resp;
            if (!resp.success) {      
                result.message = `Error - ${resp}`;
            }            
        })
        .catch((ex) => {    // Something went really wrong                     
            writeToLog('saveLocationController', `Exception caught - ${resp}`, 1);
            result.message = `Exception caught - ${resp}`;
        });    

    return result;    
}


// ------------------------------------------------------------------------------------
// Summary:  Save data to offline database.  This is the catch-all if there were
//           Network or API issues upstream.
//
// Testing:
//          1.  Don't stringify the location data.  
// ------------------------------------------------------------------------------------
async function saveLocationToOffline(data) {
    //console.log('saveLocationToOffline()', data);

    let result = { success: false, message: ''};
    
    // Save to offline database
    const jsonData = JSON.stringify({ lat: data.lat, long: data.long, acc: data.acc ?? 0, src: data.src ?? ""});    
    
    await addOfflineData('location', jsonData)
        .then((results) => {                                
            writeToLog(data.src ?? '', `Saved location to offline database.  Accuracy: ${data.acc.toFixed(2)}`);
            result.success = true;            
        })
        .catch((ex) => {
            writeToLog(data.src ?? '', `Error saving location to offline database: ${ex}`, 1);                                
        });                    

    return result;
}