/*
    Represents a 'range' component for user to choose one of multiple options.
*/

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';


export function RangeSlider({title, labels, values, initialValue, value, setValue, updateAction}) {
  // Slider component calls handleSliderChange(0) on init, 
  // so this prevents that call from overriding our initial value.
  const [ready, setReady] = useState(false);  
  const [label, setLabel] = useState('');
    

  useEffect(() => {

    const setLabels = async () => {    
      setLabel(labels[initialValue]);
    }
    setLabels();

  },[]);


  // Update the label as user is dragging the slider
  const handleSliderChange = (value) => {          
    if (ready) {
      const newValue = Math.round(value);      
      setLabel(labels[newValue]);      
    }
    else { setReady(true); }
  }


  // Update the value when the user stops dragging the slider
  const handleSliderComplete = (value) => {  
    const index = Math.round(value);
    const newValue = values[index];
    
    // HOC Function - Do something when the slider updates
    setValue(newValue);  
    updateAction(newValue);
  }
  

  return(
    <View style={styles.slider}>      
      <View style={{width: '100%',flex:1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.text}>[{label}]</Text>   
      </View>
           
      <Slider
          style={{width: '100%', height: 40, marginBottom: 30}}           
          step={1}       
          minimumValue={0}
          maximumValue={values.length-1}
          value={initialValue}  
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          
          onValueChange={(value) => handleSliderChange(value)}   
          onSlidingComplete={(value) => handleSliderComplete(value)}       
      />
    </View>
  );
}

const styles = StyleSheet.create({    
    slider: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
    },
    text: {      
      fontSize: 12,       
      color: 'gray',      
      textTransform: 'uppercase'
    },
    smallText: {    
      color: 'white',
      textAlign: 'center'
    }   
  });
  