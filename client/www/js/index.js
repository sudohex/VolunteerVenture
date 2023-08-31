/*
App: Volunteer Venture
Main JS 
Created: July 17, 2023
Authors: Pyae Phyo Kyaw, Briana Loughlin, Mahammad Juber Shaik
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

var baseURL = "http://localhost:3000/api/";
var apiEndPoints = {
    login: "signin",
    createVlntrAccount: "signup",
    updateVlntrAccount: "dummy_url",
    locations: "locations",
    categories: "categories",
    services: "services?q="

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
            console.log(inputType + " " + inputValue);
            var isValid = isValidInput(inputType, inputValue);
            if (isValid == false) {
                allValidInputs = false;
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
 * 
 * @param {string} inputType 
 * @param {*} inputValue 
 * @param {string} originalPassword 
 * @returns 
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

            if (inputValue) {
                return true;
            } else { //Empty or null
                return false;
            }

        default:
            console.log("Invalid input type");
            return false; // Invalid input type
    }
}

/**
 *
 * @param {string} formId
 * @returns {JSON}
 */

function readFormData(formId) {
    var formData = $("#" + formId).serializeArray();
    var formDataObject = {};

    formData.forEach(function(field) {
        var fieldName = field.name;
        var fieldValue = decodeURIComponent(field.value || "");

        // Checking if the field already exists in the object
        if (formDataObject.hasOwnProperty(fieldName)) {

            if (Array.isArray(formDataObject[fieldName])) {
                if (fieldName == 'select-consent') { //if this is NOTIFCATION preference
                    if (fieldValue == 'isSMSOn') {
                        formDataObject['isSMSOn'] = [formDataObject['isSMSOn'], true];
                    } else if (fieldValue == 'isEmailOn') {
                        formDataObject['isEmailOn'] = [formDataObject['isEmailOn'], true];
                    }
                } else { //all other inputs with multiple values
                    formDataObject[fieldName].push(fieldValue);
                }

            } else {

                formDataObject[fieldName] = [formDataObject[fieldName], fieldValue];
            }
        } else {

            formDataObject[fieldName] = fieldValue;
        }
    });
    var formDataJSON = JSON.stringify(formDataObject);

    return formDataJSON;
}



// document.addEventListener('deviceready', onDeviceReady, false);
$(document).ready(onDeviceReady)

function onDeviceReady() {

    //Initiate Daterangepicker plugin
    $('input[name="date-range"]').daterangepicker({

        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear',
            format: 'DD-MM-YYYY'
        }

    });
    //SET value to it
    $('input[name="date-range"]').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
    });


    //CHANGES FROM - MAHAMMAD 

    //START of "input" JS validation
    $("input,select").on("blur change", function() {
        //When user finish to input this event will be in action

        // Get the current input element and its attributes
        var thisInputElem = $(this); // The input element being interacted with
        var thisInputVal = thisInputElem.val(); // Current value of the input
        var inputParam = thisInputElem.attr("data-param"); // Parameter associated with the input

        if (inputParam) { //Proceed only if "data-param" is defined 

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
        } // END of is data-param attribute defined check
    }); //END of input validation;

    //CHANGES FROM - MAHAMMAD 
    $("#signin-form").submit(async function(event) {
        event.preventDefault();

        var formId = "signin-form";
        // 1. Validate form finally before submission
        var isValidForm = finalFormValidation(formId);
        // 2. Collect data from the form
        var formData = readFormData(formId);
        // 3. Proceed to send the POST request 
        if (isValidForm) {

            $.ajax({
                type: 'POST',
                url: baseURL + apiEndPoints.login,
                data: formData,
                contentType: 'application/json',
                success: function(response) {
                    // 4. Handle the response

                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));

                    alert('Successfully signed in!');
                    $.mobile.changePage("#public-home");

                },
                error: function(error) {

                    alert('Error signing in: ' + error.responseJSON.message);
                }
            });

        } else {
            $("html, body").animate({
                scrollTop: $("#" + formId).offset().top,
            }, 1000);
        }
    });


    // //Sign in submit
    // $("#signin-form").submit(function(e) {
    //     e.preventDefault();

    //     // 1. Collect data from the form
    //     const email = $("#signin-form input[name='email']").val();
    //     const password = $("#signin-form input[name='password']").val();

    //     if (!email || !password) {
    //         alert('Please fill in all the fields.');
    //         return;
    //     }
    //     // 2. Send the POST request
    //     $.ajax({
    //         type: 'POST',
    //         url: 'http://localhost:3000/api/signin', // update this URL if it's different
    //         data: JSON.stringify({ email, password }),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             // 3. Handle the response

    //             localStorage.setItem('token', response.token);
    //             localStorage.setItem('user', JSON.stringify(response.user));


    //             alert('Successfully signed in!');
    //             $.mobile.changePage("#public-home");

    //         },
    //         error: function(error) {

    //             alert('Error signing in: ' + error.responseJSON.message);
    //         }
    //     });
    // });

    //Sign up initialize
    $(document).on("pageshow", "#signup-page", function() {
        // Fetch and populate locations
        $.ajax({
            type: 'GET',
            url: baseURL + apiEndPoints.locations,
            dataType: 'json',
            success: function(data) {
                var locationsOptions = '<option value="">Select all that apply</option>';
                data.forEach(function(location) {
                    locationsOptions += '<option value="' + location._id + '">' + location.locationName + '</option>';
                });
                $('select[name="locations"]').html(locationsOptions).selectmenu("refresh");
            }
        });
        // Fetch and populate categories
        $.ajax({
            type: 'GET',
            url: baseURL + apiEndPoints.services,
            dataType: 'json',
            success: function(data) {
                var categoriesOptions = '<option value="">Select all that apply</option>';
                data.forEach(function(category) {
                    categoriesOptions += '<option value="' + category._id + '">' + category.categoryName + '</option>';
                });
                $('select[name="services"]').html(categoriesOptions).selectmenu("refresh");
            }
        });
    }); //END of signup page prerequisites loading

    //START of "create volunteer account"
    $("#signup-form").submit(function(event) {

        event.preventDefault();
        var formId = "signup-form";
        // 1. Validate form finally before submission
        var isValidForm = finalFormValidation(formId);
        // 2. Collect data from the form
        var formData = readFormData(formId);
        // 3. Proceed to send the POST request 
        if (isValidForm) {
            $.ajax({
                type: 'POST',
                url: baseURL + apiEndPoints.createVlntrAccount,
                data: formData,
                contentType: 'application/json',
                success: function(response) {
                    //4.Handle resposne
                    alert('Successfully signed up!');
                    $.mobile.changePage("#signin-page");
                },
                error: function(error) {
                    if (error.status === 400 && error.responseText.includes("email")) {
                        alert('Email already exists.');
                    } else {
                        alert('Error signing up: ' + error.responseText);
                    }
                }
            });

        } else {
            $("html, body").animate({
                scrollTop: $("#" + formId).offset().top,
            }, 1000);
        }
    }); //END of create volunteer account



    // //Sign up submit
    // $("#signup-form").submit(function(e) {
    //     e.preventDefault();

    //     var email = $('#email').val();
    //     var password = $('#password').val();
    //     var firstName = $('#firstName').val();
    //     var lastName = $('#lastName').val();
    //     var phoneNo = $('#phoneNo').val();
    //     var isSMSOn = $('#select-consent option[value="isSMSOn"]').is(':selected');
    //     var isEmailOn = $('#select-consent option[value="isEmailOn"]').is(':selected');
    //     var locations = $('select[name="locations"]').val();
    //     var categories = $('select[name="services"]').val();

    //     // Validation
    //     if (!email || !password || !firstName || !lastName || !phoneNo) {
    //         alert('Please fill in all the fields.');
    //         return;
    //     }

    //     if (password.length < 8) {
    //         alert('Password should be at least 8 characters.');
    //         return;
    //     }

    //     if (!locations || !locations.length) {
    //         alert('Please select your preferred locations.');
    //         return;
    //     }

    //     if (!categories || !categories.length) {
    //         alert('Please select your preferred service categories.');
    //         return;
    //     }

    //     var formData = {
    //         email: email,
    //         password: password,
    //         firstName: firstName,
    //         lastName: lastName,
    //         phoneNo: phoneNo,
    //         isSMSOn: isSMSOn,
    //         isEmailOn: isEmailOn,
    //         preferences: {
    //             locations: locations,
    //             categories: categories
    //         }
    //     };

    //     $.ajax({
    //         type: 'POST',
    //         url: 'http://localhost:3000/api/signup',
    //         data: JSON.stringify(formData),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             alert('Successfully signed up!');
    //             $.mobile.changePage("#signin-page");
    //         },
    //         error: function(error) {
    //             if (error.status === 400 && error.responseText.includes("email")) {
    //                 alert('Email already exists.');
    //             } else {
    //                 alert('Error signing up: ' + error.responseText);
    //             }
    //         }
    //     });
    // });

    //Services
    $(document).on("pageshow", "#public-home", function() {
        //Only logged in user can see this page 
        checkAuthentication();

        // Initial load of services
        fetchServices();

        // Search form submission
        $("#search-form").on("submit", function(e) {
            e.preventDefault();
            var query = $("#searchForCollapsibleSet").val();
            fetchServices(query);
        });

        // Function to fetch services based on query
        function fetchServices(query = "") {
            $.ajax({
                type: 'GET',
                url: baseURL + apiEndPoints.services + `${query}`,
                dataType: 'json',
                success: function(services) {
                    renderServices(services);
                },
                error: function(error) {
                    console.error("Error fetching services:", error);
                }
            });
        }

        // Function to render services in the collapsible set
        function renderServices(services) {
            var $collapsibleSet = $("#collapsiblesetForFilter");
            $collapsibleSet.empty(); // Clear existing services

            services.forEach(service => {

                console.log(service);
                // Convert locations array into a user-friendly list
                let locationsList = service.locations.map(loc => `<li>${loc.locationName}</li>`).join('');
                console.log("locations are " + locationsList);
                // Category presentation
                let categoryDisplay = service.category ? `<p><strong>Category:</strong> ${service.category.categoryName}</p>` : '';

                var serviceCollapsible = `
        <div data-role="collapsible">
            <h3>${service.serviceName}</h3>
            <p>${service.description}</p>
            ${categoryDisplay}
            <p><strong>Locations:</strong></p>
            <ul>
                ${locationsList}
            </ul>
        </div>
    `;
                $collapsibleSet.append(serviceCollapsible);
            });

            $collapsibleSet.collapsibleset("refresh");
        }
    });
    //Logout
    $(".signout-btn").click(function(e) {
        e.preventDefault();
        localStorage.clear();
        alert('Logged out successfully!');
        $.mobile.changePage("#signin-page");

    });

    //Notifications 


}

function checkAuthentication() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        alert('You need to be logged in to access this page.');
        $.mobile.changePage("#signin-page");
    }
}