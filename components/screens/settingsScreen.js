/*

    Settings Screen is responsible for displaying the list of available user settings,
    and allowing the user to change them (in which case, sends updates to API).    

    This is part of the 'Main Screen' Bottom Tabs.

*/

// React
import React from 'react';

// Canned UI
import { ToastAndroid, StyleSheet, ScrollView, Text, View } from 'react-native';

// Custom UI
import { RangeSlider } from '../forms/rangeSlider';
import { ColorPicker } from '../forms/colorPicker';
import { ImagePicker } from '../forms/imagePicker';

// Controllers
import { saveUserSetting } from '../../api/fetch';
import { useMapSettingsContext } from '../../context/mapSettingsProvider';



export function SettingsScreen({ navigation, email }) {
  // Context
  const { frequency, distance, avatarColor, avatarImage } = useMapSettingsContext();
  const [ frequencyValue, setFrequencyValue ] = frequency;
  const [ distanceValue, setDistanceValue ] = distance;
  const [ colorValue, setColorValue ] = avatarColor;
  const [ imageValue, setImageValue ] = avatarImage;
    
  // These are now used for rendering History markers
  const speedLabels = ["None", "Some", "Most", "Lots", "All"];
  const speedValues = [0, 50, 25, 15, 1];
   
  // These are now used for setting the background task update distance
  const distanceLabels = ["20 yards", "100 yards", "1/8 mile", "1/4 mile", "1 mile", "5 miles"];
  const distanceValues = [20, 100, 201, 402, 1609, 8045];


  // get the indexes from context values since components are using array indexes
  let initialSpeedIndex = speedValues.indexOf(frequencyValue);  
  if (initialSpeedIndex < 0) initialSpeedIndex = 0;

  let initialDistanceIndex = distanceValues.indexOf(distanceValue);
  if (initialDistanceIndex < 0) initialDistanceIndex = 0;
    
   
  // -------------------------------------------------------------
  //  Makes a call to the API to save updated user settings.
  // -------------------------------------------------------------
  const saveSetting = (key, value) => {
    //console.log("Save Setting: ", key, value);
    saveUserSetting(key, value);
  }

  //console.log('Settings Screen: ', email);

  // -------------------------------------------------------------
  //  SAVE FOR LATER -> Do something when tab is pressed.
  // -------------------------------------------------------------
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("tabPress", async(e) => {
  //       // do stuff
  //       console.log("Tab Press:  Settings");
  //   })

  //   // unsubscribe when component unmounts
  //   return () => unsubscribe();
  // }, [navigation]);


  // -------------------------------------------------------------
  // Handle scenario where user is not logged in
  // -------------------------------------------------------------
  if (email === null) {
    return <View style={styles.container}><Text>You need to be logged in for this screen to function.</Text></View>
  }
  
  console.log('Render');

  return (   

    <ScrollView style={styles.container} overScrollMode='never'>           

        {/* HOW MANY WAYPOINTS OF HISTORY TO DISPLAY */}
        <RangeSlider           
          title="Display History"
          labels={speedLabels}
          values={speedValues}
          initialValue={initialSpeedIndex}
          value={frequencyValue}
          setValue={setFrequencyValue}          
          updateAction={(newValue) => saveSetting("updateSpeed", newValue)}
        />

        {/* HOW FAR TO TRAVEL BEFORE TRIGGERING A LOCATION UPDATE */}
        <RangeSlider 
          title="Minimum Distance to Update"
          labels={distanceLabels}
          values={distanceValues}
          initialValue={initialDistanceIndex}
          value={distanceValue}
          setValue={setDistanceValue}
          updateAction={(newValue) => { 
              const message = "You must restart Background Tracking for this to take effect.";
              ToastAndroid.show(message, ToastAndroid.SHORT); 
              saveSetting("updateDistance", newValue)
            } 
          }
        />

        {/* AVATAR IMAGE LIST - This scrolls horizontally */}        
        <ImagePicker 
          initialImage={imageValue} 
          setValue={setImageValue}
          updateAction={(newValue) => saveSetting("avatarImage", newValue)}
        />
        
        {/* AVATAR COLOR GRID */}        
        <ColorPicker 
          initialColor={colorValue} 
          setValue={setColorValue}
          updateAction={(newValue) => saveSetting("avatarColor", newValue)}
        />

        {/* SPACING */}
        <View style={{height: 50}}></View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
    container: {
      padding:20,
      height:'100%',             
    },
    centerText: {
      textAlignVertical: "center", textAlign: "center" 
    }
  });
  