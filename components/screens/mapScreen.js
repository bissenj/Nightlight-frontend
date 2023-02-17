/*
    Map Screen is responsible for displaying a map, retrieving gps position and user's positions,
    and saving location.

    This is part of the 'Main Screen' Bottom Tabs.
*/

// React stuff
import React, { useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Canned UI 
import { StyleSheet, ToastAndroid, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Callout, Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
//import * as Location from 'expo-location';

// Custom UI
import { MapTypeSelector } from '../map/mapTypeSelector';
import { AvatarMarker } from '../map/avatarMarker';
import { useMapSettingsContext } from '../../context/mapSettingsProvider';

// Services
import { getCurrentLocation } from '../../services/getLocationService';
import { saveLocationData } from '../../services/saveLocationService';
import { getUsers } from '../../api/fetch';

// Helpers
import { isOnline, checkSpeed2 } from '../../util/network';
import { writeToLog } from '../../database/localLoggingDatabase';
import { haversineDistance } from '../../util/haversine';
import { convertMetersToFeet, convertStringToCoords } from '../../util/calculations';

// Constants
const NAME = 'Map Screen';


export function MapScreen({ navigation, email }) {

    // Initial location the Map loads to.
    const initialCoords = {
        latitude: 48.2759719,
        longitude: -114.33998,
        latitudeDelta: 1.05,
        longitudeDelta: 1.05        
    }
    
    // Context
    const { frequency, distance, avatarColor, avatarImage } = useMapSettingsContext();
    const [ frequencyValue, setFrequencyValue ] = frequency;
    const [ distanceValue, setDistanceValue ] = distance;
    const [ colorValue, setColorValue ] = avatarColor;
    const [ imageValue, setImageValue ] = avatarImage;
    
    // Map UI Data
    const mapRef = useRef(null);
    const [mapType, setMapType] = useState('standard');
    const [zoom, setZoom] = useState(0.10);
    const [zoomSpeed, setZoomSpeed] = useState(2000);
    const [altitude, setAltitude] = useState(0);

    // UI Data
    const [location, setLocation] = useState([]);
    const [users, setUsers] = useState([]);
    const [coords, setCoords] = useState(null);    
    const [counter, setCounter] = useState(1);
    const [errorMsg, setErrorMsg] = useState(null);  

    // State
    const [isValidUser, setIsValidUser] = useState(false);    
    const [isAnimating, setIsAnimating] = useState(true);   // for performance, dont render history while map is animating

    // Future -> Line Measurement feature
    const [measureCoord, setMeasureCoord] = useState(null);
    const [measureMode, setMeasureMode] = useState(false);

    // REFs
    const lastestCount = useRef(counter);
    const latestZoom = useRef(zoom);
   

    // Try to solve the warnings about state being updated on unmounted component, the correct way.
    //
    // Result:  Got a step closer by monitoring the abortController signal.
    //          Am I just doing the isMounted() hack but in a different way?
    //          Need to add optional abort controller signal to Fetch requests downstream
    //          to really do it the right way.
    //          
    // https://medium.com/doctolib/react-stop-checking-if-your-component-is-mounted-3bb2568a4934            
    const abortController = new AbortController();

    
    // -------------------------------------------------------------
    //  When app is mounted (once - within the main screen)
    // -------------------------------------------------------------
    useEffect(() => {
        console.log("Component is mounting.", abortController.signal);

        // unsubscribe when component unmounts
        return () => {
            console.log("Component is unmounting.", abortController.signal);
            abortController.abort();
            console.log("...abortController done", abortController.signal);
        } 
    }, []);


    // -------------------------------------------------------------
    //  When screen gets focused (everytime tab changes to map)
    // -------------------------------------------------------------
    useFocusEffect(
        React.useCallback(() => {                   // try to cache this for performance
            const startUp = async() => {
                try {                
                    //const online = await isOnline();
                    if (true) {           // TODO:  this doesn't work as expected, find a new way
                        //checkSpeed2();
                        // Check if we have a valid user ---- HACK                
                        const validUser = (email !== null);
                        setIsValidUser(validUser);
                                
                        // Update the map location
                        getLocation(validUser);

                        // Update the users on the map
                        requestUsers();    
                    }
                    else {
                        console.log("user is not online.");
                    }
                }
                catch(ex) {
                    writeToLog('mapScreen', `Exception caught - ${ex}`, 1);
                }   
            };
            startUp();         

            return () => {
                console.log("Component is losing focus.");
            }                 
        }, [])         
    );

      
    // BUG:  Unable to use intervals because of time differences between
    //       test device and windows pc.  The intervals are extremely short
    //       for some reason, like a 2000ms delay is only 20ms so it makes 
    //       debugging difficult.
    //   
    //
    // Ryan's custom hook so setInterval has access to latest state.
    // useInterval(async () => {        
    //     setIsRunning(false);    // stop the timer
    //     await requestUsers();
    //     setIsRunning(true);     // start the timer
    // }, isRunning ? delay : null);   
          

    // -------------------------------------------------------------
    //  Used to update the map location
    // -------------------------------------------------------------
    function updateMapLocation(coords) {  
        //console.log("updateMapLocation: ", coords)  ;
        setCounter(lastestCount.current++);
        
        if (coords && mapRef && mapRef.current) {    
            //console.log("Animating Map ", counter);  
            mapRef.current.animateToRegion(coords, zoomSpeed);                    
            setZoomSpeed(500);
        }
        else {
            console.log("...Unable to animate map");
        }
    }


    // -------------------------------------------------------------
    //  get the list of users, their position, and history
    // -------------------------------------------------------------
    async function requestUsers() {
        const online = await isOnline();
        if (online) {
            const result = await getUsers();
            if (result.success && result.data) {      
                
                // DEBUGGING
                //   Can we use abortController here to prevent Memory Leak Warnings?
                if (abortController.signal.aborted) {
                    console.log('requestUsers(): Component is already unmounted, bailing');
                    return;
                }

                setUsers(result.data);      
                showToast("Got updated user locations");
            }
            else if (!result.success && result.error == 401) {                
                writeToLog(NAME, 'User is no longer authenticated', 1);
            }
            else {
                writeToLog(NAME, 'Network error while getting users', 1);                                
            }
        }
        else {
            writeToLog(NAME, 'requestUsers():  No network connection?', 1);                            
        }
    }    


    // -------------------------------------------------------------
    //  Handle the map zoom logic to keep it in a proper range 
    //  and to call map to update when it changes.
    // -------------------------------------------------------------
    const updateZoom = async (adjust) => {   
        const smallestZoom = 0.00014;
        const largestZoom = 40;
        
        // Controls whether the zoom value goes up or down.
        let zoomModifier = 0.25;         // zoom in by decreasing zoom value    
        if (adjust > 0) {
            zoomModifier = 2.5;        // zoom out by increasing zoom value
        }

        // Calculate the new zoom value and keep it in an acceptable range.
        latestZoom.current = zoom * zoomModifier;
        if (latestZoom.current < smallestZoom)  newZoom = smallestZoom;
        if (latestZoom.current > largestZoom) newZoom = largestZoom;

        // // set the new zoom
        setZoom(latestZoom.current);    

        // Animation the map - // pass in newZoom directly because setting state ends up being slow to update.
        handleLocationChange(location); //, newZoom);
    }


    // -------------------------------------------------------------
    //  Takes in a new location and optionally zoom level, 
    //  sets state and animates map.
    // -------------------------------------------------------------
    const handleLocationChange = (currentLocation) => {

        // DEBUGGING
        //   Can we use abortController here to prevent Memory Leak Warnings?
        if (abortController.signal.aborted) {
            console.log('handleLocationChange(): Component is already unmounted, bailing');
            return;
        }

        // Get the elevation and convert to feet.        
        const altitudeFeet = convertMetersToFeet(currentLocation.elevation);
        setAltitude(altitudeFeet);
        
        // Update state with our new location
        setLocation(currentLocation);       
            
        // Update coords with new location
        var gpsCoords = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: latestZoom.current,  // 0.01
            longitudeDelta: latestZoom.current, //0.01
        }            
        setCoords(gpsCoords);    
        
        // Set a flag so waypoints are not rendered while animating (for performance)
        setTimeout(() => {
            setIsAnimating(true);
        }, 500);

        // Animate the map
        updateMapLocation(gpsCoords); 

        // Reset the flag so waypoints get rendered
        setTimeout(() => {
            setIsAnimating(false);
        }, zoomSpeed);        
    }


    // -------------------------------------------------------------
    //  Display a message to the user when something notable happens
    // -------------------------------------------------------------
    function showToast(message) {
        console.log("showToast: ", message);
        ToastAndroid.show(message, ToastAndroid.SHORT);
    }
    

    // -------------------------------------------------------------
    //  Attempt to get GPS location from Expo
    //  This is only called from the Front End
    // -------------------------------------------------------------
    async function getLocation(validUser = false) {
                
        // let currentLocation = await Location.getCurrentPositionAsync({
        //     enableHighAccuracy: true,
        //     accuracy: Location.Accuracy.BestForNavigation,            
        // });

        let resp = await getCurrentLocation();
        let currentLocation = null;
        if (resp.success) {
            currentLocation = resp.data;
        }
        else {
            console.error('Unable to get location');
            return;
        }
        
        if (currentLocation) {
            console.log(`Got current location (FRONT END) - ${validUser}: `, currentLocation, abortController.signal.aborted);
            
            // DEBUGGING
            //   Can we use abortController here to prevent Memory Leak Warnings?
            if (abortController.signal.aborted) {
                console.log('getLocation(): Component is already unmounted, bailing');
                return;
            }

            showToast("Got current location");
            handleLocationChange(currentLocation, zoom);
            
            // If we have a user, attempt to save location to database
            if (validUser) {
                console.log("Saving Location from Front End");

                // Save location to database if device is online.                               
                const locationObject = { lat: currentLocation.latitude, long: currentLocation.longitude, acc: currentLocation.accuracy, src: NAME};
                const response = await saveLocationData(locationObject);   
            }
        }
    }

    // OLD CODE....WHY IS THIS HERE AND WHAT IS IT DOING?    
    let text = 'Waiting..';
    if (errorMsg) {
      text = errorMsg;
    } else if (location) {
      text = JSON.stringify(location);
    }

    // const getZoom = async() => {
    //     if (this.mapRef) {
    //         const coords = await this.mapRef.getCamera();
    //         setZoom(coords.center.zoom); // sets variable zoom the value under coords.center.zoom
    //         //https://stackoverflow.com/questions/46568465/convert-a-region-latitudedelta-longitudedelta-into-an-approximate-zoomlevel
    //     }
    // }
    

    // -------------------------------------------------------------
    //  Future Enhancement - distance measuring tool
    // -------------------------------------------------------------
    function storeMarker(e) {
        //console.log(e.nativeEvent.coordinate);
        if (measureCoord) {
            setMeasureCoord(null);            
        }
        else {
            setMeasureCoord(e.nativeEvent.coordinate);

            const coordinates = [
                {latitude: coords.latitude, longitude: coords.longitude}, 
                {latitude: measureCoord.latitude, longitude: measureCoord.longitude}
            ]  
            // Calculate the distance.
            const distance = haversineDistance(coords.latitude, coords.longitude, measureCoord.latitude, measureCoord.longitude);            
            const measurement = distance.toFixed(2);

            // Display distance on screen
            showToast(`Distance: ${measurement}`);
        }
    }


    // -------------------------------------------------------------
    //  Future Enhancement - distance measuring tool
    // -------------------------------------------------------------
    function getMeasurementCoords() {        
        const coordinates = [
            {latitude: coords.latitude, longitude: coords.longitude}, 
            {latitude: measureCoord.latitude, longitude: measureCoord.longitude}
        ] 
        //console.log("getMeasurementCoords() - ", coordinates);

        // Calculate the distance.
        //const distance = haversineDistance(coords.latitude, coords.longitude, measureCoord.latitude, measureCoord.longitude);
        //const feet = convertMilesToFeet(distance);
        //const measurement = distance.toFixed(2);
        //showToast(`Distance: ${measurement}`);

        return coordinates;
    }

    console.log('Render');

    return (
      <View style={styles.flexContainer}>            
        <MapView    
            ref={mapRef} 
            // onRegionChangeComplete={() => getZoom()}
            style={styles.map} mapType={mapType}
            initialRegion={initialCoords}            
            onPress={() => { if (measureMode) storeMarker(); }}
        >
             {measureMode && measureCoord && 
                <Polyline
                    coordinates={getMeasurementCoords()}
                    strokeColor="#1E90FF"
                    strokeWidth={3} 
                    //lineDashPattern={[60, 40]}
                    //lineCap={"square"}
                >                                       
                </Polyline>
            }  

            { users && users.map((contact) => (    
                    (contact.currentUser && coords) ?          
                    <AvatarMarker 
                        key={contact.email}
                        name="Me"
                        email={contact.email}
                        latitude={coords.latitude}
                        longitude={coords.longitude}
                        aColor={contact.settings.avatarColor}
                        aImage={contact.settings.avatarImage}  
                        history={contact.coordinates} 
                        historySetting={frequencyValue}    
                        historyHidden={isAnimating}                 
                    /> :
                    (contact.coordinates.length > 0) ? <AvatarMarker 
                        key={contact.email}
                        name={contact.name}
                        email={contact.email}
                        latitude={contact.coordinates[0].latitude}
                        longitude={contact.coordinates[0].longitude}
                        //timestamp={contact.coordinates[0].timestamp}
                        aColor = {contact.settings.avatarColor}
                        aImage = {contact.settings.avatarImage}
                        history={contact.coordinates}                      
                        historySetting={frequencyValue}  
                        historyHidden={isAnimating}                                    
                    />
                    : 
                    null                    
                    )
                )
            }       
            { (!users || users.length === 0) && coords &&
                    <Marker                     
                    coordinate={convertStringToCoords(`${coords.latitude}, ${coords.longitude}`)} 
                    tracksViewChanges={false} 
                    // anchor={{x: 0.5, y: 0.5}}
                    zIndex={10}       
                >              
                </Marker> 
            }     
            
        </MapView>

        {isValidUser &&        
            // Refresh users on map
            <TouchableOpacity style={styles.mapButton} onPress={requestUsers}>            
                <Ionicons name={'ios-people-sharp'} size={24} color="green" />
            </TouchableOpacity>
        }
        {!isValidUser && 
            // Refresh location on map
            <TouchableOpacity style={styles.mapButton} onPress={getLocation}>            
                <Ionicons name={'location-outline'} size={24} color="green" />
            </TouchableOpacity>
        }        


        {/* Change map type */}
        <MapTypeSelector handleChange={(val) => setMapType(val)} />

        {/* Elevation Text or random debugging stat  */}
        <View style={styles.altitudeContainer}>
            <Text style={{color: 'gray'}}>
                <Text style={{fontSize: 12}}>Elevation: </Text>
                <Text style={{fontWeight: 'bold'}}>{altitude}</Text>
                {/* <Text>{getCurrentDateTimeForDatabase()}</Text> */}
            </Text>
        </View>

        {/* Zoom in */}
        <TouchableOpacity style={styles.zoomIn} onPress={() => updateZoom(-0.05)}>            
            <Ionicons name={'add'} size={24} color="green" />
        </TouchableOpacity>

        {/* Zoom out */}
        <TouchableOpacity style={styles.zoomOut} onPress={() => updateZoom(0.05)}>            
            <Ionicons name={'remove'} size={24} color="green" />
        </TouchableOpacity>        
        
      </View>
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
    overlayContainer: {
        zIndex: 10,
        position:'absolute',
        top: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        padding: 20
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height-25,
        zIndex:1,
        position: 'relative'
    },
    marker: {
        width: 40,
        height: 40,        
        borderRadius:25,  
        padding: 0,
        margin: 0,                      
        borderColor: '#3498DB', 
        borderWidth: 4,    
        overflow: 'hidden',
        zIndex: 5    
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    text: {        
        position: 'absolute',
        top: 0,
        left: '35%',
        
        fontSize: 28,
        color: 'white',
        textAlign: 'center',        
        textTransform: 'uppercase' ,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 10  
    },
    line: {
        borderColor: '#3498DB',
        borderRightWidth: 2,
        height: 20,
        position: 'relative',        
        left: -19,        
        // transform: [{translateX: 10},{rotate: '-14deg'},{translateX: -10}],
        zIndex: 4
    },
    bottom: {
        borderColor: '#3498DB',
        borderRadius: 25,
        borderWidth: 2,
        width: 8,
        height: 8,
        position: 'relative',
        left: 16
    },
    callout: {
        width: 150,
        height: 150,
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',    
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderColor: '#444',
        borderWidth: 2,
        borderRadius: 5
    },
    mapButton: {        
        position: 'absolute',
        top:-40,        
        right:10,
        zIndex: 10,
        borderRadius: 5,
        borderColor: 'green',
        borderWidth: 2,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.99)'
    },    
    mapTypeContainer: {        
        position: 'absolute',
        top:10,        
        right:10,
        zIndex: 10,   
        width: 36     
    },
    mapTypeButton: {  
        borderRadius: 5,
        borderColor: 'green',
        borderWidth: 2,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.99)'
    },    
    mapTypeButton2: {                
        borderRadius: 5,
        borderColor: 'green',
        borderWidth: 1,
        padding: 5,
        marginTop: 4,        
        backgroundColor: 'white'
    },
    mapTypesSelector: {
        position: 'relative',        
        top:0,    
        marginBottom:2            
    },
    altitudeContainer: {        
        position: 'absolute',
        bottom:10,        
        right:10,
        zIndex: 10,   
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 3,
        padding: 4,
        elevation: 1
    },
    zoomIn: {
        position: 'absolute',
        top:-40,        
        left:10,
        zIndex: 10,
        borderRadius: 5,
        borderColor: 'green',
        borderWidth: 2,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.99)'
    },
    zoomOut: {
        position: 'absolute',
        top:10,        
        left:10,
        zIndex: 10,
        borderRadius: 5,
        borderColor: 'green',
        borderWidth: 2,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.99)'
    }
});



