/**
 * ALL CUSTOM JAVASCRIPT WILL BE HERE
 */

/**
 * We can define custom messages to display all over the app
 */
var masterData = [{
    errorMessages: {
        "email": "Please enter a valid email.",
        "password": "Please enter a valid password.",
        "mobile": "Please enter a valid mobile number.",
        "firstName": "",
        /** TO-DO needs to be assigned with proper messages */
        "lastName": "",
        "cPassword": "",
        "prefLocation": "",
        "prefServiceCategories": "",
        "notifPref": ""
    }
}]

var baseURL = "http://localhost";
var serverPort = 8000;
var apiEndPoints = {
    login: "/login",
    createVlntrAccount: "",
    updateVlntrAccount: "",
}




/**
 * JS Validation for all form inputs
 * @param {string} inputType 
 * @param {*} inputValue 
 * @returns {boolean}
 * 
 */

function isValidInput(inputType, inputValue) {
    switch (inputType) {
        case "email":
            // Using a regular expression to validate email format
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
                return true;
            } else {
                return false;
            }
        case "mobile":
            // Using a regular expression to validate 10-digit mobile number
            if (/^\d{10}$/.test(inputValue)) {
                return true;
            } else {
                return false;
            }
        case "password":
            if (inputValue.length >= 8) {
                return true;
            } else {
                return false;
            }
        default:
            console.log("Invalid input type");
            return false; // Invalid input type
    }
}



/**
 * To Display/Hide the error messages for all form validations
 * @param {string} inputType 
 * @param {boolean} isValid 
 */
function setErrorMessage(inputType, isValid) {

    var errMsg = masterData[0]["errorMessages"][inputType]; //Custom message defined in masterdata
    var errorMessage = isValid ? "" : "<span>" + errMsg + "</span>";
    $(".err-msg[data-param='" + inputType + "']").html(errorMessage);
}


/**
 * Common function for AJAX request to the specified URL.
 * 
 * @param {string} url - The URL to send the request to.
 * @param {object} options - Additional options for the AJAX request.
 */

function ajaxRequest(url, options) {


    console.log(options);

    $.ajax({
        url: url,
        type: options.method || 'GET', // or 'POST' if you're sending data
        dataType: options.dataType || 'json', // the type of data you expect to receive
        data: options.data || null, //Always be a JSON string
        success: function(data) {
            // This function is called when the request is successful
            $('#result').html(JSON.stringify(data));
            //We can use successCallback function here
        },
        error: function(xhr, status, error) {
            // This function is called when there's an error with the request
            console.error(error);
        }
    });
} // END of common AJAX request function


/**
 * 
 * @param {string} formId 
 * @returns {JSON} 
 */

function readFormData(formId) {

    var formData = $("#" + formId).serialize();

    // Deserialize the form data into an object
    var formDataObject = {};
    formData.split('&').forEach(function(keyValue) {
        var pair = keyValue.split('=');
        formDataObject[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    formData = JSON.stringify(formDataObject);

    return formData;

}

/**
 * 
 * @param {string} formId 
 */

function validateForm(formId) {



}



/**
 * 
TO make sure all elements loaded to DOM
 */

$(document).ready(function() {

    //START of "login" authentication
    $('#sign-in').click(function() {
        var ajaxURL = apiEndPoints['login'];
        var formId = $(this).data("form-id");
        var formData = readFormData(formId); //Returns a JSON string with form key&value pairs

        var options = {
                method: 'POST',
                data: formData
            }
            //Req parameters are (URL : string,options: object with {method:'',datatype:'',data:JSON}
        ajaxRequest(ajaxURL, options);

    }); //END of "login" authentication


    //START of "create account" 
    $('#save-account').click(function() {

        var ajaxURL = apiEndPoints['createVlntrAccount'];
        var formId = $(this).data("form-id");
        var formData = readFormData(formId); //Returns a JSON string with form key&value pairs

        var options = {
                method: 'POST',
                data: formData
            }
            //Req parameters are (URL : string,options: object with {method:'',datatype:'',data:JSON}
        ajaxRequest(ajaxURL, options);

    }); //END of "create account" 


    //START of "manage/update account" 
    $('#update-account').click(function() {

        var ajaxURL = apiEndPoints['updateVlntrAccount'];
        var formId = $(this).data("form-id");
        var formData = readFormData(formId); //Returns a JSON string with form key&value pairs

        var options = {
                method: 'POST',
                data: formData
            }
            //Req parameters are (URL : string,options: object with {method:'',datatype:'',data:JSON}
        ajaxRequest(ajaxURL, options);

    }); //END of "manage/update account" 







    //START of "input" JS validation
    $("input,select").blur(function() { //When user finish to input this event will be in action
        console.log($(this).val());
        // Get the current input element and its attributes
        var thisInputElem = $(this); // The input element being interacted with
        var thisInputVal = thisInputElem.val(); // Current value of the input
        var inputParam = thisInputElem.attr("data-param"); // Parameter associated with the input


        switch (inputParam) {
            case "email":

                // Check if the input value is a valid email
                var isValid = isValidInput(inputParam, thisInputVal);
                setErrorMessage(inputParam, isValid); //Displays/Hide an input error message
                break;

            case "mobile":
                // Check if the input value is a valid password
                var isValid = isValidInput(inputParam, thisInputVal); // Type and Value
                setErrorMessage(inputParam, isValid); //Display/Hide an input error message

                break;

            case "password":

                // Check if the input value is a valid password
                var isValid = isValidInput(inputParam, thisInputVal); // Type and Value
                setErrorMessage(inputParam, isValid); //Display/Hide an input error message

            default:
                console.log("Invalid data-param or empty.");
                return false;


        }
    }); //END of input validation
}); // END of document ready