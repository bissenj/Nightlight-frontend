/*
    This creates a horizontal slider of images for the user to select from.

    Currently this is hardcoded (due to 'require') but should be moved
    to an image hosting service like Cloudinary for dynamic images.
*/

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Image, Text, View, ScrollView } from 'react-native';

export function ImagePicker({ initialImage, setValue, updateAction }) {
    const [image, setImage] = useState(initialImage);

    
    // Hardcoding images.  Alternative approach would be 
    // to serve them dynamically via something like Cloudinary.
    const images = [
        {src: require(`../../assets/mountains.jpg`), name:"mountains.jpg"},
        {src: require(`../../assets/ski.jpg`), name:"ski.jpg"},
        {src: require(`../../assets/flower.jpg`), name:"flower.jpg"},
        {src: require(`../../assets/cat.jpg`), name:"cat.jpg"},
        {src: require(`../../assets/bird.jpg`), name:"bird.jpg"},
        {src: require(`../../assets/fox.jpg`), name:"fox.jpg"},
        {src: require(`../../assets/dinosaur.jpg`), name:"dinosaur.jpg"},
        {src: require(`../../assets/kayaks.jpg`), name:"kayaks.jpg"},
        {src: require(`../../assets/sunset.jpg`), name:"sunset.jpg"},
        {src: require(`../../assets/peak.jpg`), name:"peak.jpg"},
        {src: require(`../../assets/tiger.jpg`), name:"tiger.jpg"},
        {src: require(`../../assets/wave.jpg`), name:"wave.jpg"},
        {src: require(`../../assets/polarbear.jpg`), name:"polarbear.jpg"},        
    ]
    
    const onPress = (name) => {        
        setImage(name);

        // HOC Function - Do something when the image updates   
        setValue(name);     
        updateAction(name);
    }
   

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Choose an image</Text>
            
            <ScrollView horizontal={true}>
                {images.map((item, index) => (
                    item.name == image ?  
                        <TouchableOpacity key={item.name} onPress={() => onPress(item.name)} style={[styles.imageContainer, styles.selected, {borderWidth:0}]}>                            
                            <Image                                 
                                source={item.src} 
                                style={[styles.image, styles.selected]}                            
                            />   
                        </TouchableOpacity> : 
                        <TouchableOpacity key={item.name} onPress={() => onPress(item.name)} style={styles.imageContainer}>                            
                            <Image                                 
                                source={item.src} 
                                style={styles.image}                            
                            />   
                        </TouchableOpacity>  
                    )                  
                )}            
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({  
    container: {
        marginBottom: 10
    },  
    imageContainer: {
        height: 80,
        width: 80,
        margin: 10,        
        flex:0,
        alignItems: 'center', 
        justifyContent: 'center', 
        shadowColor: "#000",        
        // elevation: 3,
        // backgroundColor: 'lightgray'
    },
    image: {
        height: 65,
        width: 65,
        borderRadius: 50,
        opacity: 0.3,
        // margin: 15,
        borderWidth: 0,
        borderColor: 'white',

        shadowColor: "#000",        
        // elevation: 3,
    },
    selected: {
        opacity: 1.0
        // borderWidth: 3,
        // borderColor: '#999', 
        // borderRadius: 15,
        // backgroundColor: '#ddd'
    },
    text: {
        color: 'gray',
        // textAlign: 'center',
        fontSize: 12,
        textTransform: 'uppercase'
    }
})