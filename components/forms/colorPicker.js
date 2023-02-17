/*
    UI component which displays a list of colors for the user 
    to choose from.
*/

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';

export function ColorPicker({ initialColor, setValue, updateAction }) {
    const [color, setColor] = useState(initialColor);

    // https://en.wikipedia.org/wiki/Web_colors
    const colors = [
        {hex: "#FF1493", name:"Deep Pink"},
        {hex: "#008000", name:"Green"},
        {hex: "#8A2BE2", name:"Blue Violet"},
        {hex: "#DC143C", name:"Crimson"},
        {hex: "#FFD700", name:"Gold"},
        {hex: "#008B8B", name:"Dark Cyan"},
        {hex: "#1E90FF", name:"Dodger Blue"},
        {hex: "#87CEFA", name:"Light Sky Blue"},
    ]

    const onPress = (hex) => {        
        setColor(hex);

        // HOC Function - Do something when the color updates
        setValue(hex);
        updateAction(hex);
    }
   

    return (
        <View>
            <Text style={styles.text}>Choose a color</Text>

            <View style={{flex:0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                {colors.map((item, index) => (
                    item.hex == color ?  
                        <TouchableOpacity key={item.hex} onPress={() => onPress(item.hex)} style={[styles.iconContainer, styles.selected, {borderWidth:1, borderColor: item.hex, backgroundColor: `${item.hex}22`}]}>
                            <View style={[styles.icon, {backgroundColor: item.hex}]}></View>
                        </TouchableOpacity> : 
                        <TouchableOpacity key={item.hex} onPress={() => onPress(item.hex)} style={styles.iconContainer}>
                            <View style={[styles.icon, {backgroundColor: `${item.hex}4f`}]}></View>
                        </TouchableOpacity>                    
                ))}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({    
    slider: {
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',        
    },
    iconContainer: {
        height: 60,
        width: 60,
        margin: 10,        
        flex:0,
        alignItems: 'center', 
        justifyContent: 'center', 
        shadowColor: "#000", 
    },
    icon: {
        height: 45,
        width: 45,
        borderRadius: 50,        
        borderWidth: 0,
        borderColor: 'white',        
        shadowColor: "#000",  
    },
    selected: {        
        borderColor: '#999', 
        borderRadius: 15,
        backgroundColor: '#ddd'
    },
    text: {
        color: 'gray',        
        fontSize: 12,
        textTransform: 'uppercase'
    }
})