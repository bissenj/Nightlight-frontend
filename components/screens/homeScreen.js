/*
    This is the first screen which is displayed when the app loads.  It manages the 
    login process and permissions.
*/

// React
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';   // For requesting permissions

// Canned UI
import { ImageBackground, StyleSheet, Button, Text, View } from 'react-native';

// App Config & Setup
import { APP_NAME, BUILD_VERSION } from '../../secrets';
import { createOfflineTable } from '../../database/localOfflineDatabase';
import { createLoggingTable } from '../../database/localLoggingDatabase';

// Controllers
import { setToken, getToken } from '../../api/token';
import { getUserSettings } from '../../api/fetch';
import { startBackgroundUpdate, stopBackgroundUpdate, isBackgroundTracking, locationService } from '../../util/taskManagement';

// Constants
const appName = APP_NAME;               // "Nightlight";
const appVersion = BUILD_VERSION;       // "Build:  05/22/2022-A";


export function HomeScreen({ navigation }) {

  const [hasPermission, setPermission] = useState(false);                 // Android Permissions
  const [isLoggedIn, setIsLoggedIn] = useState(false);                    // Authentication
  const [errorMsg, setErrorMsg] = useState(null);                     
  const [userSettings, setUserSettings] = useState({})                
  const [userEmail, setUserEmail] = useState(null)
  const [runningInBackground, setRunningInBackground] = useState(true);   // State
  
  
  // -------------------------------------------------------------
  //  When app is mounted
  // -------------------------------------------------------------
  useEffect(() => { 

    const startUp = async () => {
      console.log("App -> is Mounted");

      await stopBackgroundUpdate();   // Should we do this here?  Or should it start tracking immediately?
      checkPermissions();             // Check if user has approved needed app permissions   

      checkForBackgroundTask();       // Double check things are stopped.  (Need it here?) 
      
      /// Make sure databases are created.     
      //
      // Logging database
      await createLoggingTable()
        .then(() => {})
        .catch((err) => {
          console.error("Create Logging table failed: ", err);
        });
      //
      // Offline database
      await createOfflineTable()
        .then(() => {})
        .catch((err) => {
          console.error("Create Offline table failed: ", err);
        });

    };
    startUp();    

    return shutDownApp;     // cleanup when app unmounts

  }, []);


  // -------------------------------------------------------------
  //  Runs when Screen gets focus 
  // -------------------------------------------------------------
  useFocusEffect(
    React.useCallback(() => {
      //console.log("HomeScreen -> is Focused");

      checkForUser();   
      checkForBackgroundTask();
      
    }, [])         
  );


  // -------------------------------------------------------------
  //  Run when app shuts down
  // -------------------------------------------------------------
  const shutDownApp = () => { 
    //console.log("Home App -> Clean up");
    locationService.clear();
    stopBackgroundUpdate();
  }  


  // -------------------------------------------------------------
  //  Check if background task is running and set flag appropriately
  // -------------------------------------------------------------
  const checkForBackgroundTask = async () => {    
    const isRunning = await isBackgroundTracking();    
    setRunningInBackground(isRunning); 
  }


  // -------------------------------------------------------------
  //  Start location tracking in background
  // -------------------------------------------------------------
  const startBackgroundTask = async() => {    
    // get update distance setting
    let updateDistance = userSettings["updateDistance"] || 402;     //default to 0.25 mile    

    startBackgroundUpdate(updateDistance); 
    setRunningInBackground(true)
  }


  // -------------------------------------------------------------
  //  Stop location tracking in background
  // -------------------------------------------------------------
  const stopBackgroundTask = async() => {
    locationService.clear();
    stopBackgroundUpdate();
    setRunningInBackground(false);
  }

  
  // -------------------------------------------------------------
  //  Check if there is a JWT token saved on the device.  
  //  If so, the user is considered logged in.  If not, the user is not logged in.  
  //  Get user settings if possible at this time as well (may not work in airplane mode)
  //
  //  Once logged in, user stays logged in indefinitely until server tells App the 
  //  user is not authenticated.  (To ensure the App works offline)
  // -------------------------------------------------------------
  async function checkForUser() {
    const token = await getToken();
      
    if (token) {
      //console.log("User has a token.");
      setIsLoggedIn(true);

      // Get user settings
      const result = await getUserSettings();
      //console.log('getUserSettings(): ', result);
      if (result && result.success) {          
        const settings = JSON.parse(result.data);        
        setUserSettings(settings);
        setUserEmail(result.email);
      }       
      else {    // network request had issues for some reason        
        // Server said user is not authenticated
        if (result?.error === 401) {
          setIsLoggedIn(false);   
        }
      } 
    }
    else {    // No token, so user is not logged in. 
      setIsLoggedIn(false);
    }
  }


  // -------------------------------------------------------------
  //  Requests location permissions
  // -------------------------------------------------------------
  const requestPermissions = async () => {    
    let { status } = await Location.requestForegroundPermissionsAsync();

    // Check if Foreground permissions are enabled
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setPermission(false);
      return;                     // No permissions, so bail
    }
    else {
      let bkPerm = await Location.requestBackgroundPermissionsAsync();
      
      // Check if background permissions are enabled
      if (bkPerm.status !== 'granted') {
        setErrorMsg('Permission to access background location was denied');
        setPermission(false);
        return;                   // No permissions, so bail
      }
      else {
        // BUG?:  I think if bkPerm.status fails or returns something else this
        //       code gets run even though the background permission has not been approved.  
        //     
        setPermission((hasPermission) => setPermission(true));  
        setErrorMsg('');            
      }
    }
  };


  // -------------------------------------------------------------
  //  Check to see if user has approved location permissions.  
  //  If not, request button will be visible.
  // -------------------------------------------------------------
  const checkPermissions = async() => {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {   
      console.log("User has approved foreground app permissions"); 

      let bkPerm = await Location.requestBackgroundPermissionsAsync();
      if (bkPerm.status === 'granted') {
        console.log("User has approved background app permissions");

        // All good
        setPermission((hasPermission) => setPermission(true));      
      }
    }
  }


  // -------------------------------------------------------------
  //  Logout process - Clear the JWT token stored on the device  
  // -------------------------------------------------------------
  const logOutUser = async () => {    
    await setToken('');        
    await setIsLoggedIn(false);    
  };


  console.log('Render');

  return (
    <>    
    <View style={styles.flexContainer}>          
      <ImageBackground source={require('../../assets/mountains.jpg')} style={styles.image} resizeMode="cover">              
        <View style={styles.flexMContainer}>  

          {/* TOP SECTION OF SCREEN - HEADING */}
          <View>
            <Text style={styles.headerText}>{appName}</Text>   
            <Text style={styles.tinyText}>{appVersion}</Text>   
          </View>    

          {/* BOTTOM CONTROLS */}
          <View>

            {/* LOGIN BUTTON */}
            {!isLoggedIn &&        
              <Button            
                title="Login"
                onPress={() => navigation.navigate("Login" )}
              />    
            }

            {/* OPEN MAP BUTTON */}
            {isLoggedIn && hasPermission &&        
              <View style={{marginTop: 10}}>
                <Button            
                  title="Open Map"
                  onPress={() => navigation.navigate('Main', {settings: userSettings, email: userEmail})} 
                />    
              </View>
            }

            {/* REQUEST PERMISSIONS BUTTON */}
            {!hasPermission && 
              <View style={{marginTop: 10}}>
                <Button
                  title="Request Permissions"
                  onPress={() => requestPermissions()}
                />
              </View>
            }

            {/* LOGOUT BUTTON */}
            {isLoggedIn && 
              <View style={{marginTop: 10}}>
                <Button                        
                  title="Log out"
                  onPress={() => logOutUser()}                
                />  
              </View>
            }

            {/* STOP BACKGROUND TRACKING BUTTON */}
            {runningInBackground && 
              <View style={{marginTop: 10}}>
                <Button                        
                  title="Stop Background Tracking"
                  onPress={() => { stopBackgroundTask() }}    
                  color='red'            
                />  
              </View>
            }

            {/* START BACKGROUND TRACKING BUTTON */}
            {(!runningInBackground && userSettings["avatarColor"]) && 
              <View style={{marginTop: 10}}>
                <Button                        
                  title="Start Background Tracking"
                  onPress={() => { startBackgroundTask() }}    
                  color='green'            
                />  
              </View>
            }

          </View>
          
          {/* ERROR MESSAGES */}
          { errorMsg && 
            <Text style={styles.smallText}>{errorMsg}</Text>
          }
      </View>      
      </ImageBackground>
    </View>
    </>
  );
}


const styles = StyleSheet.create({
    container: {
      padding:40,              
    },
    flexContainer: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',    
    },
    flexMContainer: {
      padding: 40,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-around',    
    },
    headerText: {
      fontSize: 28,
      color: 'white',
      textAlign: 'center',
      fontStyle: 'italic',
      textTransform: 'uppercase' ,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 10  
    },
    tinyText: {
      fontSize: 12,
      color: 'white',
      textAlign: 'center',
      fontStyle: 'italic',
      textTransform: 'uppercase' ,
    },
    text: {
      fontSize: 24,       
      color: 'white',
      textAlign: 'center'
    },
    smallText: {    
      color: 'white',
      textAlign: 'center'
    },
    image: {
      flex: 1,
      width: '100%',
      justifyContent: "center",    
    },  
    overlay: {
      position: 'absolute',
      top: '51.5%',
      zIndex: 1,
      // opacity: 0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      height: '50%',
      width: '100%',
      // transform: ([{ rotateZ: '-30deg' }, {translateY: -40}, {translateX: -140}])
      // transform: ([{translateY: 100}])
    },
    button: {
      position:'relative',
      zIndex: 10
    }
  });
  