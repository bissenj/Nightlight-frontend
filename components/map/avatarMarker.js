/*
    This is the Avator image representing a user that shows up on the map screen.

    Besides the image it also manages the list of historical waypoints for a particular user.
*/

// React
import { React } from 'react'

// Canned UI
import { StyleSheet, Text, View, Image } from 'react-native';
import { Callout, Marker, Polyline } from 'react-native-maps';

// Custom UI
import { AvatarTimelineMarker } from './avatarTimelineMarker';

// Helpers
import { convertStringToCoords, convertStringToDate, getCurrentDateTimeForDatabase } from '../../util/calculations';


/*
    Props:
        email: User's email.
        name:  User's display name.
        latitude: last recorded latitude coordinate.
        longitude: Last recorded longitude coordinate.
        aColor: User's primary color from their settings.
        aImage: User's primary image from their settings.
        history: list of waypoints for the day for this user.
        historySeting:  how many waypoints to display (ex: none, some, all), comes from user's setting.

*/
export function AvatarMarker( {email, name, latitude, longitude, aColor, aImage, history, historySetting, historyHidden}) {    

    // TODO:  Pull images from Cloudinary.
    // Currently needs to be in sync with imagePicker.js which is a bad practice.
    function getImage(image) {
        
        switch(image) {
            case 'ski.jpg':
                return require('../../assets/ski.jpg');                
            case 'flower.jpg':
                return require('../../assets/flower.jpg'); 
            case 'cat.jpg':
                return require('../../assets/cat.jpg');    
            case 'dinosaur.jpg':
                return require('../../assets/dinosaur.jpg');    
            case 'bird.jpg':
                return require('../../assets/bird.jpg');    
            case 'fox.jpg':
                return require('../../assets/fox.jpg');    
            case 'tiger.jpg':
                return require('../../assets/tiger.jpg');    
            case 'polarbear.jpg':
                return require('../../assets/polarbear.jpg');
            case 'wave.jpg':
                return require('../../assets/wave.jpg');    
            case 'sunset.jpg':
                return require('../../assets/sunset.jpg');    
            case 'peak.jpg':
                return require('../../assets/peak.jpg');    
            case 'kayaks.jpg':
                return require('../../assets/kayaks.jpg');    
            default:
                return require('../../assets/mountains.jpg');
        }        
    }   

    const position = convertStringToCoords(`${latitude}, ${longitude}`);
    const color = aColor || '#D7BDE2';
    const image = aImage || 'flower.jpg';
    

    const getTime = (points) => {        
        if (points && points[0]) {
            return points[0].timestamp;
        }
        return getCurrentDateTimeForDatabase();
    }

    const getCoordinates = (points) => {
        const coords = history.map(point => ({latitude: parseFloat(point.latitude), longitude: parseFloat(point.longitude)}));       
        return coords;
    }
        
    // Create a point on map to show where user was.  For performance reasons,
    // this function may skip points depending on a user setting.  
    const renderAvatarHistory = (point, color, index) => {
        const random = Math.random(1000);
        const uuid = point.id + random;

        const leftOver = index % historySetting;
        
        return (leftOver == 0 ?
                <AvatarTimelineMarker
                    latitude={point.latitude}
                    longitude={point.longitude}                        
                    aColor={color}
                    index={index}
                    key={uuid}
                    timestamp={point.timestamp}                    
                />
                : 
                null
                );
    }

    return (
        <>        
            <Marker 
                key={email} 
                coordinate={position} 
                // tracksViewChanges={false}     // see discussion online that this may be a performance improvement
                anchor={{x: 0.5, y: 0.5}}
                zIndex={10}          
            >
                <View style={[styles.marker, {borderColor: color}]}>                        
                    <Image 
                        source={getImage(image)} 
                        style={styles.avatarImage}                                                            
                    />                        
                </View>
                
                <Callout tooltip>
                    <View style={[styles.callout, {borderColor: color}]}>
                        <Text>{name}</Text>
                        <Text>Last Updated: </Text>
                        <Text style={{padding:5, fontSize: 10}}>{convertStringToDate(getTime(history))}</Text>
                        <Text>History: </Text>
                        <Text style={{padding:5, fontSize: 10}}>{history.length || 0}</Text>
                    </View>
                </Callout>
            </Marker>
            
            {!historyHidden &&
                <View>
                    {history.map((point, index) => (
                        renderAvatarHistory(point, color, index)
                    ))}

                    {/* Alternative history approach of drawing lines between each point */}
                    {/* <Polyline
                        coordinates={getCoordinates(history)}
                        strokeColor="#1E90FF"
                        strokeWidth={3} 
                        lineDashPattern={[60, 40]}
                        lineCap={"square"}
                        >                                       
                    </Polyline> */}
                </View>
            }
        </>
    );
}

const styles = StyleSheet.create({          
    marker: {
        width: 40,
        height: 40,           
        borderRadius:25,  
        padding: 0,
        margin: 0,                      
        borderColor: '#3498DB', 
        borderWidth: 4,    
        overflow: 'hidden',
        zIndex: 5,          
    },
    avatarImage: {
        width: '100%',
        height: '100%',
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
    line: {
        borderColor: '#3498DB',
        borderRightWidth: 2,
        height: 20,
        position: 'relative',        
        left: -19,                    
        zIndex: 4
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
    }
});