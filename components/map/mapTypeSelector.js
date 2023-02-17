/*
    Custom select box for the type of map to be used.
*/

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export function MapTypeSelector({handleChange}) {
    const [selected, setSelected] = useState(1);
    const [focused, setFocused] = useState(false);
    
    // These relate to the options that google maps provides for it's map type.
    const mapTypes = [
        {
            id: 1,
            value: 'standard',
            icon: 'car-outline'
        },
        {
            id: 2,
            value: 'satellite',
            icon: 'earth-outline'

        },
        {
            id: 3,
            value: 'terrain',
            icon: 'map-outline'

        },
    ];


    // Custom button per map type available.
    function MapTypeOption({icon, id, action}) {
        const theStyle = (id === selected) ? [styles.mapTypeButton2, styles.selected] : styles.mapTypeButton2;
        const iconStyle = (id === selected) ? styles.iconSelected : styles.iconDefault;
        
        return (
            <TouchableOpacity style={theStyle} onPress={() => (action(id))}>            
                <Ionicons name={icon} size={24} style={iconStyle}  />
            </TouchableOpacity>
        )
    }
    
    // This is what gets rendered by the React Native Flatlist component for each
    // item in the data array that gets passed to it.
    const Item = ({item}) => (        
        <MapTypeOption icon={item.icon} id={item.id} action={handleSelect}/>
    );
 

    // Toggles the map-type list (show / hide)
    const pressed = () => {        
        setFocused(!focused);
    }

    // Called when new map-type is selected.  Updates the UI to reflect
    // the new map type selcted.
    const handleSelect = (id) => {        
        setSelected(id);
        pressed();          // Hide the map-type list.

        const mapTypeValue = mapTypes[id-1].value;
        handleChange(mapTypeValue);     // callback to HOC to do something when map-type changes.
    }

    return (
        <View style={styles.mapTypeContainer}>
            {/* Map-type options button.  Always visible */}
            <Pressable style={styles.mapTypeButton} onPress={pressed}>            
                <Ionicons name={'map-outline'} size={24} color="green" />
            </Pressable>

            {/* List of available map-types.  Visibility is toggled */}
            { focused && 
                <View style={styles.mapTypesSelector}>
                    <FlatList                
                        data={mapTypes}
                        renderItem={Item}
                    />
                </View>
            }
        </View>         
    );
}


const styles = StyleSheet.create({      
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
        // position: 'absolute',
        // top:10,        
        // right:10,
        // zIndex: 10,
        borderRadius: 5,
        borderColor: 'green',
        borderWidth: 2,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.99)'
    },    
    mapTypeButton2: {                
        borderRadius: 5,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 5,
        marginTop: 4,        
        // backgroundColor: 'white'
        color: 'gray',
        backgroundColor: 'rgba(255,255,255, 0.7)',
    },
    selected: {        
        color: 'white',
        //backgroundColor: 'white'
        backgroundColor: 'rgba(0,0,0, 0.2)',        
        borderColor: 'white',
    },
    iconDefault: {
        color: 'gray'
    },
    iconSelected: {
        color: 'white'
    },
    mapTypesSelector: {
        position: 'relative',        
        top:0,    
        marginBottom:2    
        // right:24,
        // width: 60,        
        // backgroundColor: 'rgba(255, 0, 0, 0.5)'
    }
});