/*
    Reuseable Custom Form used by screen components.
*/

import React, { useState } from 'react';
import { Text, View, KeyboardAvoidingView, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import { hasValidationError, validateFields } from './validation';
import Field from './field';
import SubmitButton from './submitButton';


const getInitialState = (fieldKeys) => {
    const state = {};
    fieldKeys.forEach((key) => {
        state[key] = '';
    });
    return state;
};

const animationTimeout = () =>
    new Promise((resolve) => setTimeout(resolve, 700));


const Form = ({ action, afterSubmit, buttonText, fields, message, title = "", instructions = "", clearAfterSubmit = true, navigation = undefined, navigateTo = undefined }) => {    
    const fieldKeys = Object.keys(fields);
    const [values, setValues] = useState(getInitialState(fieldKeys));
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState(getInitialState(fieldKeys));
    const [opacity] = useState(new Animated.Value(1));
    const [isSubmitting, setSubmitting] = useState(false);    
    

    const clearForm = () => {        
        setValues(getInitialState(fieldKeys));
    }

    
    const onChangeValue = (key, value) => {        
        const newState = { ...values, [key]: value };
        setValues(newState);

        if (validationErrors[key]) {
            setValidationErrors({ ...validationErrors, [key]: '' });
        }
    }


    const getValues = () => {
        //return fieldKeys.sort().map((key) => values[key]);
        return fieldKeys.map((key) => values[key]);
    }


    const fadeOut = () =>
        Animated.timing(opacity, { toValue: 0.2, duration: 200, useNativeDriver: true }).start();


    const fadeIn = () =>
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();


    const submit = async () => {
        let isLeaving = false;
        
        // Reset error messages
        setErrorMessage('');
        setValidationErrors(getInitialState(fieldKeys));
        setSubmitting(true);

        //console.log("Values: ", values);

        // Client side field validation.
        const errors = validateFields(fields, values);
        if (hasValidationError(errors)) {
            console.error(errors);
            setSubmitting(false);
            return setValidationErrors(errors);
        }
        
        // If we got here we're ready to send web request.
        //const values = getValues();

        fadeOut();
        try {
            const [result] = await Promise.all([
                action(...getValues()), 
                animationTimeout()
            ]);            
            
            await afterSubmit(result);
            if (clearAfterSubmit) {
                clearForm();
            }

            if (navigation && navigateTo) {
                isLeaving = true;
                //console.log("LoginScreen (after Submit) - About to navigate to: ", navigateTo);
                navigation.navigate(navigateTo);
            }            
        }
        catch(ex) {
            console.error("Form - Error caught: ", ex);

            // Handle any validation errors from server
            if (ex.data) {
                Object.entries(ex.data).map(([key, value]) => (                                       
                    setValidationErrors({ ...validationErrors, [key]: value })                                
                ))
            }           

            setErrorMessage(ex.message);
        }
        finally {
            // This fixes the no-op after screen is leaves (ie. successful login)
            if (!isLeaving) {                
                fadeIn();
                setSubmitting(false);
            }
        }
    }
    
    return (
        <KeyboardAvoidingView style={styles.container}>   
            <Text style={styles.title}>{title}</Text>                        
            
            <Text>{instructions}</Text>  
            
            {message && 
                <Text>{message}</Text>                        
            }                      
            
            <Text style={styles.error}>{errorMessage}</Text>
           
            <Animated.View style={{ opacity }} >
                {isSubmitting && (
                    <View style={styles.activityIndicatorContainer}>
                        <ActivityIndicator size="large" color="#3F5EFB" />
                    </View>
                )}
                {fieldKeys.map((key) => {
                    // Get the field
                    const field = fields[key];
                    // Check for any validation errors on this field
                    const fieldError = validationErrors[key];

                    return (
                        <Field
                            key={key}
                            fieldName={key}
                            field={fields[key]}
                            error={validationErrors[key]}
                            onChangeText={onChangeValue}
                            value={values[key]}
                        />
                    );                
                })}
            </Animated.View>
            <SubmitButton title={buttonText} onPress={submit} isSubmitting={isSubmitting} />            
        </KeyboardAvoidingView>  
    );  
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',        
        position: 'relative',        
        margin: 10,
        padding: 20
    },
    activityIndicatorContainer: {
        position: 'absolute',
        flex: 1,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    title: {
        fontSize: 20
    },
    error: { 
        marginBottom: 20,        
        color: 'red',        
    }    
});

export default Form;