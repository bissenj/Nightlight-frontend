/*
    Central logic for syncing offline data with backend via API.
    If successful, will mark the record as complete, but will not actually
    delete the record from the device.

    Used by Background Tasks, and offline Screen.
*/

// Helpers
import { writeToLog } from '../database/localLoggingDatabase';
import { getOfflineData, updateOfflineData } from '../database/localOfflineDatabase';

// Controllers
import { saveLocationData } from './saveLocationService';


// Constants
const PENDING = 0;
const COMPLETE = 1;
const ERROR = 99;
const LOCATION_CATEGORY = 'location';


export async function syncOfflineData() {

    let offlineData = [];

    // STEP 1:  Get Data
    await getOfflineData()
    .then((results) => {
        offlineData = results;
    })
    .catch((ex) => {
        console.log('Caught Error getting items: ', ex);
    }); 

    // STEP 2:  Loop through offline data
    if (offlineData && offlineData.length > 0) {    

        // Process all data, but wait to proceed until all 
        // individual transactions are done.
        await Promise.all(offlineData.map(async (item) => {

            // Only update Pending records.
            if (item.status == PENDING) {
            
                // Only update 'location' records.
                if (item.category == LOCATION_CATEGORY) {

                    const locationObject = JSON.parse(item.data);      // put data string back into an object.
                    if (locationObject.lat && locationObject.long) {   // location validation
                    
                        // Send location to API
                        try {                                                                                
                            const response = await saveLocationData(locationObject, true, false);                            
            
                            // If save was successful, mark the item as complete.
                            if (response.success) {    
                                // UPDATE DATA
                                await updateOfflineData(item.id, COMPLETE)
                                .then((results) => {
                                    //console.log("Updated Item", item);   
                                })
                                .catch((ex) => {                                    
                                    writeToLog('syncController', `Exception caught while updating offline data - ${ex}`, 1)
                                });
                            }                
                        }
                        catch(ex) {
                            writeToLog('syncController', `Exception caught while saving location data - ${ex}`, 1)
                        }
                    }
                    else {    // location validation failed
        
                        // If missing lat and long data, mark item as error                         
                        await updateOfflineData(item.id, ERROR)
                            .then((results) => {})
                            .catch((ex) => {
                                writeToLog('syncController', `location is missing data - ${ex}`, 1)
                            });     
                        }
                    }
                }
            }
        ));    // END of PROMISE.ALL
    
        console.log('PROMISE.ALL IS DONE.');
    }
}