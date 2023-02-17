/*
    Login screen is responsible for collecting username/password and sending it to 
    API to check if user is valid.  If so, cache the JWT which gets returned
    so user stays logged in for a long duration.

    This is part of the 'Home Screen' Stack
*/

// React
import React from 'react';

// Canned UI
import { KeyboardAvoidingView, ImageBackground, StyleSheet, View, Text } from 'react-native';

// Custom Forms
import Form from '../forms/form';
import { validateContent, validateLength } from '../forms/validation';

// Controllers
import { loginUser } from '../../api/fetch';
import { setEmailToken, setToken } from '../../api/token';


const LoginScreen = ({ navigation }) => {    

  // DATA
  //const [errorMessage, setErrorMessage] = useState('');
   
  // -------------------------------------------------------------
  //  Logic to handle response back from Login API
  //  Sets tokens if reponse was succcessful or sets
  //  error message if not.
  // -------------------------------------------------------------
  const handleResult = async (result) => {
    //console.log("After Submit: ", result);
    if (result?.success && result?.data) {
      // User has authenticated at this point.  Store the token and email.
      await setToken(result.data.jwt);
      await setEmailToken(result.data.email);

      // INVESTIGATE:  Its possible that navigating here causes a no-op if form attempts to clear itself after this.
      //navigation.navigate('Home');
    }
    else if (!result?.success && result?.message) {      
      //throw new Error(`Login Error: ${result.message}`, result)  
      throw result;    
    }    
    else {      
      throw new Error('Something went wrong.');
    }
  }

  
  console.log('Render');

  return (
    <View style={{flex:1, justifyContent: "center", alignItems: "center"}}>

      {/* BACKGROUND IMAGE */}
      <ImageBackground source={require('../../assets/mountains.jpg')} style={styles.image} imageStyle={{opacity:0.3}} resizeMode="cover">
      <KeyboardAvoidingView style={{flex:1, justifyContent: "center", alignItems: "center"}}>

        {/* CUSTOM FORM */}
        <Form            
          title="Login"    
          action={loginUser}
          afterSubmit={handleResult}
          buttonText="Submit"
          fields={{
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
          navigation={navigation}
          navigateTo="Home"     
        />

        {/* FORGOT PASSWORD */}
        <Text 
          style={{height: 60, textDecorationLine: 'underline', color:'white'}}
          onPress={() => navigation.navigate("Forgot")}>
          Forgot Password?
        </Text>

        {/* CREATE ACCOUNT */}
        <Text style={{height: 60, color:'white'}} >
            No Account?  
            <Text style={{color: 'rgba(0,0,0,0)'}} >
              ''
            </Text>
            <Text 
              style={{height: 60, textDecorationLine: 'underline', color:'white'}}
              onPress={() => navigation.navigate("Create")}>
              Create one here
            </Text>          
        </Text> 
        </KeyboardAvoidingView>  
      </ImageBackground>   
    </View>
  )
}

const styles = StyleSheet.create({  
  image: {
    flex: 1,
    width: '100%',
    justifyContent: "center",        
  }
});

export default LoginScreen;