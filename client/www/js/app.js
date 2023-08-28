/**
 * ALL CUSTOM JAVASCRIPT WILL BE HERE
 */

/**
 * We can define custom messages to display all over the app
 */
var masterData = [{
    errorMessages: {
        email: "Please enter a valid email.",
        password: "Please enter a valid password.",
        mobile: "Please enter a valid mobile number.",
        firstName: "First name should be 3-50 characters.",
        /** TO-DO needs to be assigned with proper messages */
        lastName: "Last name should be 3-50 characters.",
        cPassword: "Password and confirm password do not match",
        prefLocation: "Please select a location.",
        prefServiceCategories: "Please select atleast one option",
        notifPref: "Please select atleast one option.",
    },
}, ];

var baseURL = "http://localhost";
var serverPort = 8000;
var apiEndPoints = {
    login: "/login",
    createVlntrAccount: "/dummy_url",
    updateVlntrAccount: "/dummy_url",
    //TO-DO Need to define all the endpoints
};
var routes = {
    vlntrLogin: "",
    vlntrHome: "",
    vlntrNotif: "",
    vlntrUpdateAcc: "",
    //TO-DO Need to define all the routes
};

/**
 * JS Validation for all form inputs
 * @param {string} inputType
 * @param {*} inputValue
 * @returns {boolean}
 *
 */

function isValidInput(inputType, inputValue, originalPassword = "") {
    switch (inputType) {
        case "email":
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);

        case "mobile":
            return /^\d{10}$/.test(inputValue);

        case "password":
            return inputValue.length >= 8; //TO-DO need to fix the length after discussion(8)

        case "cPassword":
            return originalPassword === inputValue;

        case "firstName":
            return /^[A-Za-z]{2,50}$/.test(inputValue); //TO-DO need to fix the length after discussion(Min:2,Max:50)

        case "lastName":
            return /^[A-Za-z]{2,50}$/.test(inputValue); //TO-DO need to fix the length after discussion(Min:2,Max:50)

        case "prefLocation":
        case "prefServiceCategories":
        case "notifPref":
            if (inputValue.trim() === "") {
                //Empty means no option selected
                return false;
            } else {
                return true;
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
    var navigateTo = options.navigationUrl; //Empty if no need to redirect/navigate

    $.ajax({
        url: url,
        type: options.method || "GET", // or 'POST' if you're sending data
        dataType: options.dataType || "json", // the type of data you expect to receive
        data: options.data || null, //Always be a JSON string
        success: function(data) {
            $("#result").html(JSON.stringify(data));
            //TO-DO implement successCallback  here
            if (navigateTo != "") {}
        },
        error: function(xhr, status, error) {
            //TO-DO Proper error handling
            console.error(error);
        },
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
    formData.split("&").forEach(function(keyValue) {
        var pair = keyValue.split("=");
        formDataObject[pair[0]] = decodeURIComponent(pair[1] || "");
    });

    formData = JSON.stringify(formDataObject);

    return formData;
}

/**
 *
 * @param {string} formId
 */

function validateForm(formId) {}

/**
 *
 * @param {string} formId
 * @returns {boolean}
 */

function finalFormValidation(formId) {
    var allValidInputs = true; //deafult(boolean) :: if false form won't submit and shows error message at required fields
    var isRequired = "false";
    var allElements = $(
        "#" + formId + " input, #" + formId + " select, #" + formId + " :radio"
    );
    var totalElements = allElements.length;
    var processedElements = 0; //To wait for all iterations to complete

    allElements.each(function() {
        isRequired = $(this).data("required"); //predefined attr for every form element for validation{false if not req}
        if (isRequired == true) {
            inputType = $(this).data("param");
            inputValue = $(this).val();
            allValidInputs = isValidInput(inputType, inputValue);
            if (allValidInputs == false) {
                setErrorMessage(inputType, false); //Displays respective defined error message
            } else {
                setErrorMessage(inputType, true); //Erases if any prev error message
            }
        }
        processedElements++; //Increase in number for each iteration
    });
    if (processedElements === totalElements) {
        //Creates a wait to finish the .each();
        return allValidInputs;
    }
} //END of final form validation :: common for entire application

/**
 * 
 * @param {string} formId 
 * @param {string} ajaxAPIURL 
 */

function afterFormSubmission(formId, ajaxAPIURL, apiMethod) {

    var isValidForm = finalFormValidation(formId);
    if (isValidForm === true) {
        //If all inputs are valid proceed to submission
        var formData = readFormData(formId); //Returns a JSON string with form key&value pairs
        var options = {
            method: apiMethod,
            data: formData,
            navigateURL: "", //TO-DO Need to configure with predefined routes
        };
        //Req parameters are (URL : string,options: object with {method:'',datatype:'',data:JSON}
        ajaxRequest(ajaxAPIURL, options);
    } else {
        //if any one of the required inputs are invalid show error message

        $("html, body").animate({
                scrollTop: $("#" + formId).offset().top,
            },
            1000
        ); //Scroll to the top postion of the form to make user notice errors
    }
}

/**
 * 
TO make sure all elements loaded to DOM
 */

$(document).ready(function() {
    $('input[name="dates"]').daterangepicker();

    //START of "create account"
    $("#save-account").click(function() {
        var ajaxURL = apiEndPoints["createVlntrAccount"];
        var formId = $(this).data("form-id");
        afterFormSubmission(formId, ajaxURL, "POST"); //{*,*,[ANY ONE METHOD{POST/PUT/GET etc}]}Validates and performs api call
    }); //END

    //START of "login" authentication
    $("#sign-in").click(function() {
        var ajaxURL = apiEndPoints["login"];
        var formId = $(this).data("form-id");
        afterFormSubmission(formId, ajaxURL, "POST");
    }); //END of "login" authentication

    //START of "manage/update account"
    $("#update-account").click(function() {
        var ajaxURL = apiEndPoints["updateVlntrAccount"];
        afterFormSubmission(formId, ajaxURL, "PUT");
    }); //END of "manage/update account"



    //START of "input" JS validation
    $("input,select").blur(function() {
        //When user finish to input this event will be in action

        // Get the current input element and its attributes
        var thisInputElem = $(this); // The input element being interacted with
        var thisInputVal = thisInputElem.val(); // Current value of the input
        var inputParam = thisInputElem.attr("data-param"); // Parameter associated with the input
        var isEmpty = thisInputVal.trim() === "" ? true : false;

        if (isEmpty == false) {
            //IsEmptyCheck ::To avoid showing error message without submission or filling the input.

            if (inputParam.length != 0 || inputParam != "") {
                var isValid = isValidInput(inputParam, thisInputVal);
            } else if (inputParam === "cPassword") {
                var originalPwdElemId = $(this).data("parent");
                var originalPassword = $("#" + originalPwdElemId).val();
                var isValid = isValidInput(inputParam, thisInputVal, originalPassword); //Validates input based on its type defined in attribute "data-param"
            } else {
                //TO-D0 throw error
            }
            setErrorMessage(inputParam, isValid); //Displays/Hide an input error message
        } //END of IsEmptyCheck;
    }); //END of input validation;
}); // END of document ready;