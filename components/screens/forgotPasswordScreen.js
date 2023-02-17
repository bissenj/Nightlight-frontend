/*
    Forgot Password screen is responsible for collecting email address and sending it to 
    API to send a new password email.

    This is part of the 'Home Screen' Stack
*/

// React 
import React, { useState } from 'react';

// Canned UI
import { ImageBackground, StyleSheet } from 'react-native';

// Custom forms
import Form from '../forms/form';
import { createBasicAlert } from '../forms/helpers';
import { validateContent } from '../forms/validation';

// Controllers
import { resetPassword } from '../../api/fetch';


const ForgotPasswordScreen = ({ navigation }) => {    

  // DATA
  //const [errorMessage, setErrorMessage] = useState('');
      
  // Handle post back from API. If successful, navigate user to login screen.
  // If not, display error message.  
  const handleResult = async (result) => {
    //console.log("After Send: ", result);

    if (result?.success) {
      // Display message to user: 'Please check your email inbox.'.  After clicking OK, navigate to Login Screen.
      await createBasicAlert(
        "Instructions Sent", 
        "Please check your email inbox.", 
        "Ok", 
        () => {navigation.navigate("Login")}
      );           
    }
    else if (!result?.success && result?.message) {      
      // Display error message.
      throw result;    
    }    
    else {      
      throw new Error('Something went wrong.');
    }
  };


  console.log('Render');

  // RENDER
  return (
    <ImageBackground source={require('../../assets/mountains.jpg')} style={styles.image} imageStyle={{opacity:0.3}} resizeMode="cover">      
      <Form  
        title="Reset Password"      
        instructions="Enter email address below to receive password reset instructions."        
        action={resetPassword}
        afterSubmit={handleResult}
        buttonText="Send"
        fields={{
          email: {
            label: 'Email',
            validators: [validateContent],
            inputProps: {
              keyboardType: 'email-address',
            },
          },          
        }}      
      />      
    </ImageBackground>
  )
}

const styles = StyleSheet.create({  
  image: {
    flex: 1,
    width: '100%',
    justifyContent: "center",        
  }
});

export default ForgotPasswordScreen;