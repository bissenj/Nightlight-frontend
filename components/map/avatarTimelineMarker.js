/*
    Displays a Marker on the map which represents one of the history waypoints
    for a user.

    Use Size and Opacity to represent something like how recent the 
    marker is vs other markers, or how accurate, or elevation, etc.
*/

import { StyleSheet, Text, View, Image } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { convertStringToCoords, convertStringToDate } from '../../util/calculations';

export function AvatarTimelineMarker( {latitude, longitude, aColor, index, timestamp}) {
        
    const position = convertStringToCoords(`${latitude}, ${longitude}`);
    const color = aColor || '#D7BDE2';
    const size = computeSize(index);
    const opacity = computeOpacity(index);  //-0.30 + ((20 - index) / 20);
    const when = convertStringToDate(timestamp)

    function computeSize(num) {
        if (num < 10) return 9;
        if (num < 15) return 6;
        return 3;
    }

    function computeOpacity(num) {
        if (num < 5) return 0.55;
        if (num < 10) return 0.45;
        if (num < 15) return 0.35;
        return 1.0;        
    }
    
    return (
        <Marker 
            coordinate={position}
            tracksViewChanges={false}
            zIndex={0}
            // icon={require('../../assets/favicon.png')}                   
        >
            <View style={[styles.marker, {borderColor: color}, {backgroundColor: color}, {opacity: opacity}, {width: size}, {height: size}]} />                                                                           
            {/* <View style={[styles.marker, {borderColor: color}, {backgroundColor: color}, {width: size}, {height: size}]} />                                                                          */}
            <Callout tooltip>
                <View style={[styles.callout, {borderColor: color}]}>                    
                    <Text>Last Updated: </Text>
                    <Text style={{padding:5, fontSize: 10}}>{when}</Text>                    
                </View>
            </Callout>
        </Marker>        
    );
}

const styles = StyleSheet.create({      
    marker: {
        width: 30,
        height: 30,           
        borderRadius:25,  
        padding: 0,
        margin: 0,                      
        borderColor: '#3498DB', 
        borderWidth: 4,            
        zIndex: 2    
    },    
    text: {        
        position: 'absolute',
        top: -6,
        left: '35%',
        
        fontSize: 28,
        color: 'white',
        textAlign: 'center',        
        textTransform: 'uppercase' ,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 10  
    },
    callout: {
        width: 150,
        height: 75,
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',    
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderColor: '#444',
        borderWidth: 2,
        borderRadius: 5
    }
});