/*
    Uses React Context to store user settings which can be used
    by other React components.
*/

import React, { useState, useContext, createContext } from 'react';
// import { clickProps } from 'react-native-web/dist/cjs/modules/forwardedProps';

const MapSettingsContext = createContext();


export const MapSettingsProvider = ({ children, settings }) => {
    console.log("MapSettingsProvider: ", settings);

    // Translate and store the settings props (which came from database)
    //const email = settings.email;
    const uSpeed = parseInt(settings.updateSpeed) || 0;    // FYI - parseint can't handle 0
    const uDistance = parseInt(settings.updateDistance) || 20;
    const uColor = settings.avatarColor || "#fff";
    const uImage = settings.avatarImage || "undefined";

    const [frequency, setFrequency] = useState(uSpeed);
    const [distance, setDistance] = useState(uDistance);
    const [avatarColor, setAvatarColor] = useState(uColor);
    const [avatarImage, setAvatarImage] = useState(uImage);


    return (
        <MapSettingsContext.Provider 
            value={{ frequency: [frequency, setFrequency], 
                     distance: [distance, setDistance],
                     avatarColor: [avatarColor, setAvatarColor],
                     avatarImage: [avatarImage, setAvatarImage]
            }}
        >
            {children}
        </MapSettingsContext.Provider>
    )
}


// custom hook
export const useMapSettingsContext = () => {
    const context = useContext(MapSettingsContext);
    if (context === undefined) {
        throw new Error('useMapSettingsContext must be used within a MapSettingsProvider');
    }
    return context;
}