/*
    This is reponsible for sending data to and from the API.
*/

import { API_URL, AUTH_ENDPOINT, LOCATION_ENDPOINT, USER_ENDPOINT, SETTINGS_ENDPOINT, QUOTES_ENDPOINT } from '../secrets';
import { getCurrentDateTimeForDatabase } from '../util/calculations';
import { getToken, getEmailToken } from './token';
import { writeToLog } from '../database/localLoggingDatabase';


// ------------------------------------------------------------------------
//  LOGIN 
// ------------------------------------------------------------------------
export const loginUser = async (email, password) => {    
         
    try {
        const data = new FormData();
        data.append("email", email);
        data.append("password", password);
        data.append("loginType", "login");
   
        const authEndpoint = AUTH_ENDPOINT;
        console.log("Auth_Endpoint: ", authEndpoint);

        // const response = await fetch('http://192.168.0.114:3000/api/login', {
        const response = await fetch(authEndpoint, {
            method: 'POST',
            body: data,
        });
        
        if (response.ok) {
            let result = await response.json();            
            return result;
        }    
    } 
    catch (ex) {
        console.error("Error: ", ex);
    }

    return { success: false, message: "Authentication Service may be down", data: {}, error: 401 }
};

// ------------------------------------------------------------------------
//  FORGOT PASSWORD 
// ------------------------------------------------------------------------
export const resetPassword = async (email) => {        
     
    try {
        const data = new FormData();
        data.append("email", email);        
        data.append("loginType", "reset");
   
        const authEndpoint = AUTH_ENDPOINT;        
        
        const response = await fetch(authEndpoint, {
            method: 'POST',
            body: data,
        });

        if (response.ok) {
            let result = await response.json();            
            return result;
        }    
    } 
    catch (ex) {
        console.error("Error: ", ex);
    }

    return { success: false, message: "Email Service may be down", data: {}, error: 401 }
};


// ------------------------------------------------------------------------
//  CREATE ACCOUNT REQUEST
// ------------------------------------------------------------------------
export const createAccount = async (name, email, password) => {        
     
    try {
        const data = new FormData();
        data.append("name", name);
        data.append("email", email);
        data.append("password", password);
        data.append("loginType", "register");
   
        const response = await fetch(AUTH_ENDPOINT, {
            method: 'POST',
            body: data,
        });        

        if (response.ok) {
            let result = await response.json();                                   
            return result;
        }   
        else {
            throw Error('An error occurred while registering account');
        }     
       
    } 
    catch (ex) {
        console.error("Error: ", ex);
        return { success: false, message: ex.message };
    }
};


// ------------------------------------------------------------------------
//  SAVE LOCATION REQUEST
// ------------------------------------------------------------------------
export const saveLocation = async (lat, long, acc = 0, src = "") => {    
    
    // Validate parameter 1
    if (typeof lat !== 'number') {
        writeToLog('fetch', 'saveLocation(): lat needs to be a number', 1);        
        return { success: false, message: 'lat needs to be a number' };
    }
    // Validate parameter 2
    if (typeof long !== 'number') {
        writeToLog('fetch', 'saveLocation(): long needs to be a number', 1);        
        return { success: false, message: 'long needs to be a number' };
    }
     
    try {        
        const data = new FormData();        
        data.append("latitude", lat);
        data.append("longitude", long);      
        data.append("accuracy", acc);
        data.append("source", src);  
        data.append("timestamp", getCurrentDateTimeForDatabase());
        data.append("actionType", "save");

        const token = await getToken();        
   
        const response = await fetch(LOCATION_ENDPOINT, {
            method: 'POST',
            body: data,
            headers: {                
                'Authorization': `Bearer ${token}` 
            }  
        });        
        

        if (response.ok) {
            let result = await response.json();                                              
            return result;
        }   
        else {                        
            writeToLog('fetch', 'SaveLocation(): An error occurred while saving location', 1);
            throw Error('An error occurred while saving location');
        }     
       
    } 
    catch (ex) {
        console.error("Error: ", ex);
        writeToLog('fetch', `SaveLocation(): Exception caught: ${ex}`, 1);
        return { success: false, message: ex.message };
    }
};


// ------------------------------------------------------------------------
//  GET USERS REQUEST
// ------------------------------------------------------------------------
export const getUsers = async () => {    
         
    try {   
        const data = new FormData();        
        data.append("actionType", "get");

        const token = await getToken();
           
        const response = await fetch(USER_ENDPOINT, {
            method: 'POST',
            //method: 'GET',    Need to include 'body' so can't use a GET.  Refactor Nightlight-backend to request the 'method' of request.
            body: data,
            headers: {                
                'Authorization': `Bearer ${token}` 
            }  
        });               

        if (response.ok) {
            let result = await response.json(); 
            return result;
        }   
        else {            
            console.log("getUsers: An error occurred"); 
            throw Error('An error occurred while getting users');
        }     
       
    } 
    catch (ex) {
        console.error("Error: ", ex);
        return { success: false, message: ex.message };
    }
};


// ------------------------------------------------------------------------
//  GET USER SETTINGS 
// ------------------------------------------------------------------------
export const getUserSettings = async () => {        
     
    try {                       

        const data = new FormData();        
        data.append("actionType", "get-settings");

        const token = await getToken();        
   
        const response = await fetch(SETTINGS_ENDPOINT, {
            method: 'POST',     // TODO: change to 'GET'.  Need to refactor backend first.
            body: data,
            headers: {                
                'Authorization': `Bearer ${token}` 
            }  
        });        
        

        if (response.ok) {
            let result = await response.json();
            result.email = await getEmailToken();            
            return result;
        }   
        else {            
            console.log("getUserSettings: An error occurred"); 
            throw Error('An error occurred while getting user settings');
        }     
       
    } 
    catch (ex) {
        console.log("Error: ", ex);
        return { success: false, message: ex.message };
    }
};


// ------------------------------------------------------------------------
//  SAVE USER SETTINGS 
// ------------------------------------------------------------------------
export const saveUserSetting = async (key, value) => {        
     
    try {                                       
        const setting = { [key]: value };

        const data = new FormData();        
        data.append("actionType", "save-setting");
        data.append("userSettings", JSON.stringify(setting));

        const token = await getToken();        
   
        const response = await fetch(SETTINGS_ENDPOINT, {
            method: 'POST',
            body: data,
            headers: {                
                'Authorization': `Bearer ${token}` 
            }  
        });        
        

        if (response.ok) {
            let result = await response.json();                                              
            return result;
        }   
        else {            
            console.error("saveUserSetting: An error occurred"); 
            throw Error('An error occurred while saving user setting');
        }     
       
    } 
    catch (ex) {
        console.log("Error: ", ex);
        return { success: false, message: ex.message };
    }
};



