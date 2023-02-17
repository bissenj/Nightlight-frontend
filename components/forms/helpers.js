/*
    Creates an Alert box for the user to click on.  
    Provides a callback to do something after the user confirms
    the alert.
*/

import { Alert } from 'react-native';

export const createBasicAlert = (title, message, buttonText, nextAction) =>
Alert.alert(
  title,
  message, 
  [        
    { text: buttonText, onPress: () => nextAction() }
  ]
);
