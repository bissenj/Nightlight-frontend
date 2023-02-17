/*
    This is the starting navigation for the app.  Houses the logic to get into the 
    main screen as well as going through the authentication/create account/forgot password
    flow.
*/

// React
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Canned UI
import { StatusBar } from 'react-native';

// Custom Screens
import LoginScreen from '../screens/loginScreen';
import CreateAccountScreen from '../screens/createAccountScreen';
import ForgotPasswordScreen from '../screens/forgotPasswordScreen';
import {HomeScreen} from '../screens/homeScreen';
import {MainScreen} from '../screens/mainScreen';

// Constants
const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
    // const insets = useSafeAreaInsets();     // respect the phone status bar

    return (
        // <View style={{
        //     // backgroundColor: '#6a51ae',
        //     // paddingTop: insets.top,
        //     // paddingBottom: insets.bottom,
        //     // paddingLeft: insets.left,
        //     // paddingRight: insets.right
        //     flex: 1
        // }}>
            <>
            <StatusBar barStyle='dark-content' translucent backgroundColor="transparent" />
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
                <Stack.Screen name="Main" component={MainScreen} options={{headerShown: false}} />
                
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Create" component={CreateAccountScreen} />
                <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
            </Stack.Navigator>
            </>
        // </View>
    );
};

export default HomeStackNavigator;