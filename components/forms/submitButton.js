/*
    Creates an animated button which runs a callback when pressed.
*/

import React, { useState } from 'react';
import { TouchableWithoutFeedback, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';


const SubmitButton = ({ title, onPress, isSubmitting }) => {
    const [offset] = useState(new Animated.Value(1));
    const [scale] = useState(new Animated.Value(1));

    const handlePress = async () => {
        Animated.spring(offset, {
            toValue: 5,
            useNativeDriver: true, 
        }).start();
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true, 
        }).start();

        // Do whatever function the HOC has passed in.        
        await onPress();

        Animated.spring(offset, {
            toValue: 0,    
            useNativeDriver: true, 
        }).start();
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true, 
        }).start();
    };


    const transform = [
        { translateY: offset },
        { scaleY: scale },
        { scaleX: scale },        
    ];

    return (
        <TouchableWithoutFeedback onPressIn={handlePress}>
            <Animated.View style={{ transform, ...styles.container }}>
                {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.text}>{title}</Text>
                )}                
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: { 
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        backgroundColor: '#3F5EFB',
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        width: 250,
        elevation: 4,
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 80,        
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SubmitButton;
