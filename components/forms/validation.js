/*
    Provides simple validation rules for the Custom Form component.
*/

const LOOKUP_MIN_LENGTH = "minLength";
const LOOKUP_MAX_LENGTH = "maxLength";


// -------------------------------------------------------------
//  Verify the text is not blank
// -------------------------------------------------------------
export const validateContent = (validatorParams, text) => {
    //console.log("ValidateContent: ", text);
    if (!text) {
        return 'Field cannot be blank';
    }
};


// -------------------------------------------------------------
//  Verify text is a certain length (or more)
// -------------------------------------------------------------
export const validateLength = (validatorParams, text) => {
    //console.log("ValidateLength: ", validatorParams, text);

    const minLength = validatorParams[LOOKUP_MIN_LENGTH] || 4;
    if (text && text.length < minLength) {
        return `Field must be at least ${minLength} characters or more.`;
    }

    const maxLength = validatorParams[LOOKUP_MAX_LENGTH] || 4;
    if (text && text.length > maxLength) {
        return `Field must be ${maxLength} characters or less.`;
    }
}


// -------------------------------------------------------------
//  This is going to return the last validation error, or an empty string.
// -------------------------------------------------------------
export const validateField = (validators, validatorParams, value) => {
    let error = '';
    validators.forEach((validator) => {
        const validationError = validator(validatorParams, value);
        if (validationError) {
            error = validationError;
        }
    });
    return error;
}


// -------------------------------------------------------------
// Validate all fields
// -------------------------------------------------------------
export const validateFields = (fields, values) => {
    //console.log("ValidateFields: ", fields, values);

    const errors = {};

    // Get a list of field names
    const fieldKeys = Object.keys(fields);

    // validate each field
    fieldKeys.forEach((key) => {
        // Get the field Object
        const field = fields[key];

        // Get it's validations and parameters
        const validators = field.validators;
        const validatorParams = field.validatorParams;

        // Get the value of the field
        const value = values[key];

        // Execute any validations for the field and store any error that comes back.
        if (validators && validators.length > 0) {
            const error = validateField(validators, validatorParams, value);

            if (error) {
                errors[key] = error;
            }
        }
    });

    return errors;
}


// -------------------------------------------------------------
// Determine if any fields have errors
// -------------------------------------------------------------
export const hasValidationError = (errors) => {
    return Object.values(errors).find((error) => error.length > 0);
};



