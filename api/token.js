/*
    This is responsible for storing small pieces of data used 
    by the app, such as an email address, or jwt token.

    Small data, doesn't quite need the power of a full database.
*/

import AsyncStorage from '@react-native-async-storage/async-storage';


// -------------------------------------------------------------
//  Attempts to retrieve the user's auth token.
// -------------------------------------------------------------
export const getToken = async () => {
    try {
        const value = await AsyncStorage.getItem('@auth_token');
        if (value !== null) {
            return value;
        }
    } 
    catch (e) {
        return null;
    }
};


// -------------------------------------------------------------
//  Attempts to set the user's auth token.
// -------------------------------------------------------------
export const setToken = async (token) => {
    try {
        await AsyncStorage.setItem('@auth_token', token);
    }
    catch (e) {
        return null;
    }    
};


// -------------------------------------------------------------
//  Attempts to retrieve the user's email
// -------------------------------------------------------------
export const getEmailToken = async () => {
    try {
        const value = await AsyncStorage.getItem('@email_token');
        if (value !== null) {
            return value;
        }
    } 
    catch (e) {
        return null;
    }
};


// -------------------------------------------------------------
//  Attempts to set the user's email
// -------------------------------------------------------------
export const setEmailToken = async (token) => {
    try {
        await AsyncStorage.setItem('@email_token', token);
    }
    catch (e) {
        return null;
    }    
};
