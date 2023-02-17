/*
    Create Account screen is responsible for collecting username/password and sending it to 
    API to create new account.

    This is part of the 'Home Screen' Stack
*/

// React 
import React from 'react';

// Canned UI
import { ImageBackground, StyleSheet} from 'react-native';

// Custom Form
import Form from '../forms/form';
import { createBasicAlert } from '../forms/helpers';
import { validateContent, validateLength } from '../forms/validation';

// Controllers
import { createAccount } from '../../api/fetch';


const CreateAccountScreen = ({ navigation }) => {  
  console.log("CreateAccountScreen");

  // -------------------------------------------------------------
  //  Handles response back from API.  If successful, sends user
  //  to login screen.  If failed, displays message.   
  // -------------------------------------------------------------
  const handleResult = async (result) => {
    console.log("After Register: ", result);
    if (result.success) {
      //console.log("User account was created.  Sending user to login screen.");

      // Display message to user: 'Please check your email inbox.'.  After clicking OK, navigate to Login Screen.
      await createBasicAlert(
        "Account Created", 
        "Redirecting to Login screen.", 
        "Ok", 
        () => {navigation.navigate("Login")}
      );  
      
    }
    else if (!result.success && result.message) {
      throw new Error(`${result.message}`);    
      // Test Cases:
      // 1.  User already exists
      // 2.  Validation errors [blank fields, short/long password]
    }
    else {
      throw new Error('Something went wrong while trying to create account.');
      // Test Cases:
      // 1.  API is down
      // 2.  No network connection
    }
  }

  
  console.log('Render');

  return (
    /* BACKGROUND IMAGE */
    <ImageBackground source={require('../../assets/mountains.jpg')} style={styles.image} imageStyle={{opacity:0.3}} resizeMode="cover">      

    {/* CUSTOM FORM */}
    <Form 
      title="Create New Account"      
      action={createAccount}
      afterSubmit={handleResult}
      buttonText="Create"
      // message={helpMessage}      
      fields={{
        name: {
          label: 'Name',
          validators: [validateContent],          
        },
        email: {
          label: 'Email',
          validators: [validateContent],
          inputProps: {
            keyboardType: 'email-address',            
          },
        },
        password: {
          label: 'Password',
          validators: [validateContent, validateLength],
          validatorParams: {
            minLength: 5,
            maxLength: 12
          },
          inputProps: {
            secureTextEntry: true,            
          },
        },
      }}
    />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({  
  image: {
    flex: 1,
    width: '100%',
    justifyContent: "center",        
  }
});

export default CreateAccountScreen;