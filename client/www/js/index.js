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

var baseURL = "http://localhost:3000/";
var apiEndPoints = {
    login: "login",
    createVlntrAccount: "signup",
    updateVlntrAccount: "profile", //PUT
    locations: "location",
    categories: "category",
    services: "service", //service?q=
    notifications: "notifications",
    profile: "profile", //GET
    volunteers: "/volunteer", //GET
    forgotPassword: "", // TO-DO add url
    filterVolunteers: "",

    //TO-DO Need to define all the endpoints
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
            console.log(inputType + inputValue);
            if (isValid == false) {
                allValidInputs = false;
                setErrorMessage(inputType, false, formId); //Displays respective defined error message
            } else {
                setErrorMessage(inputType, true, formId); //Erases if any prev error message
            }
        }
        processedElements++; //Increase in number for each iteration
        console.log(allValidInputs);
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
 * @param {string} formId 
 */
function setErrorMessage(inputType, isValid, formId = "") {
    var errMsg = masterData[0]["errorMessages"][inputType]; //Custom message defined in masterdata
    var errorMessage = isValid ? "" : "<span>" + errMsg + "</span>";
    $("#" + formId + " .err-msg[data-param='" + inputType + "']").html(errorMessage);
}

/**
 * 
 * @param {string} inputType 
 * @param {*} inputValue 
 * @param {string} originalPassword 
 * @returns {boolean}
 */
function isValidInput(inputType, inputValue, originalPassword = "") {


    switch (inputType) {
        case "email":
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue);

        case "mobile":
            return true;

        case "password":
            return inputValue.length >= 6; //TO-DO need to fix the length after discussion(8)

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





    var thisForm = $("#" + formId);
    var disabled = thisForm.find(':input:disabled').removeAttr('disabled');
    var formData = thisForm.serializeArray();
    disabled.attr('disabled', 'disabled');
    var formDataObject = {};
    var preferredChannels = [];



    formData.forEach(function(field) {
        var fieldName = field.name;
        var fieldValue = decodeURIComponent(field.value || "");

        if (fieldName === "preferred_categories" || fieldName === "preferred_locations" || fieldName === "preferred_channels") {

            if (!formDataObject[fieldName]) {
                formDataObject[fieldName] = [fieldValue];
            } else {
                formDataObject[fieldName].push(fieldValue);
            }
        } else {
            // For other fields, check if they already exist in the object
            if (formDataObject.hasOwnProperty(fieldName)) {
                if (Array.isArray(formDataObject[fieldName])) {
                    // If it's an array, push the value
                    formDataObject[fieldName].push(fieldValue);
                } else {
                    // If it's not an array, convert it to an array
                    formDataObject[fieldName] = [formDataObject[fieldName], fieldValue];
                }
            } else {
                // If the field doesn't exist, create a new entry
                formDataObject[fieldName] = fieldValue;
            }
        }
    });

    //formDataObject.preferred_channels = preferredChannels.join(" &| ");

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
        $("#search-form").submit();
        console.log("Going to submit");
    });


    $("#btn-forgotpwd,#btn-forgotpwd-staff").on("click", function(e) {
        e.preventDefault();

        var formId = $(this).attr("data-form-id");

        // 1. Validate form finally before submission
        var isValidForm = finalFormValidation(formId);
        // 2. Collect data from the form
        var formData = readFormData(formId);
        // 3. Proceed to send the POST request 
        if (isValidForm) {

            $.ajax({
                type: 'POST',
                url: baseURL + apiEndPoints.forgotPassword, //SAME for Volunteer & Staff
                data: formData,
                contentType: 'application/json',
                success: function(response) {
                    // 4. Handle the response

                    if (response) {
                        $("#reset-pas-response").html("Your password has been sent to your email.");
                        $.mobile.changePage();
                    }

                },
                error: function(error) {

                    alert('Error sending email: ' + error.msg);
                }
            });

        } else {
            // $("html, body").animate({
            //     scrollTop: $("#" + formId).offset().top,
            // }, 1000);
        }


    });


    //CHANGES FROM - MAHAMMAD 

    //START of "input" JS validation
    $("input,select").on("blur change", function() {

        //When user finish to input this event will be in action

        // Get the current input element and its attributes
        var thisInputElem = $(this); // The input element being interacted with
        var thisInputVal = thisInputElem.val(); // Current value of the input
        var inputParam = thisInputElem.attr("data-param"); // Parameter associated with the input
        var formId = $(this).closest('form').attr("id");

        if (inputParam) { //Proceed only if "data-param" is defined 

            var isEmpty = typeof thisInputVal === "string" && thisInputVal.trim() === "" ? true : false;


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
                setErrorMessage(inputParam, isValid, formId); //Displays/Hide an input error message
            } //END of IsEmptyCheck;
        } // END of is data-param attribute defined check
    }); //END of input validation;


    $("#signin-form,#signin-form-staff").submit(async function(event) {
        event.preventDefault();

        var whichLogin = $(this).data("user");

        var formId = $(this).attr("id");
        // 1. Validate form finally before submission
        var isValidForm = finalFormValidation(formId);
        // 2. Collect data from the form
        var formData = readFormData(formId);
        // 3. Proceed to send the POST request 
        if (isValidForm) {

            $.ajax({
                type: 'POST',
                url: baseURL + apiEndPoints.login, //SAME for Volunteer & Staff
                data: formData,
                contentType: 'application/json',
                success: function(response) {
                    // 4. Handle the response

                    localStorage.setItem('token', response.token);
                    if (whichLogin == "STAFF") {
                        $.mobile.changePage("#staff-home-page");
                    } else {
                        $.mobile.changePage("#public-home");
                    }
                    alert('Successfully signed in!');
                },
                error: function(error) {


                    alert('Error signing in: ' + readAPIError(error));
                }
            });

        } else {
            $("html, body").animate({
                scrollTop: $("#" + formId).offset().top,
            }, 1000);
        }
    });




    function fetchLocations(action = "") {
        // Fetch and populate locations
        $.ajax({
            type: 'GET',
            url: baseURL + apiEndPoints.locations,
            dataType: 'json',
            success: function(data) {

                if (action == "staff" || action == "volunteer") {
                    var locationsOptions = '<option value="">Select one option</option>';
                } else {
                    var locationsOptions = '<option value="">Select all that apply</option>';
                }


                data.forEach(function(location) {
                    locationsOptions += '<option value="' + location._id + '">' + location.locationName + '</option>';
                });
                if (action == "edit") {

                    $('#update-locations').html(locationsOptions).selectmenu().selectmenu("refresh");
                } else {
                    $('select[name="preferred_locations"]').html(locationsOptions).selectmenu().selectmenu("refresh");
                }

            }
        });
    } //END of fecthLocations

    function fetchAllServices(action = "") {


        $.ajax({
            type: 'GET',
            url: baseURL + apiEndPoints.categories, //previously apiEndPoints.services
            dataType: 'json',
            success: function(data) {
                if (action == "staff") {
                    var categoriesOptions = '<option value="">Select one option</option>';
                } else {
                    var categoriesOptions = '<option value="">Select all that apply</option>';
                }

                data.forEach(function(category) {
                    //console.log(category);
                    categoriesOptions += '<option value="' + category._id + '">' + category.categoryName + '</option>';
                });

                if (action == "edit") {
                    $("#update-select-services-menu").html(categoriesOptions).selectmenu().selectmenu("refresh");
                    fetchProfile(); //gets user profile data from server

                } else {
                    $('select[name="preferred_categories"]').html(categoriesOptions).selectmenu().selectmenu("refresh");
                }

            }
        });

    }




    //Sign up initialize
    $(document).on("pagecreate", "#signup-page", function() {
        console.log("inside page create");
        managePageActive();
        //1.Fetch and populate locations
        fetchLocations("volunteer");
        //2.Fetch and populate categories
        fetchAllServices();

    }); //END of signup page prerequisites loading




    //List of volunteers initialize
    $(document).on("pagecreate", "#volunteer-list-page", function() {
        checkAuthentication();
        //1.Fetch and populate locations
        fetchLocations();
        //2.Fetch and populate categories
        fetchAllServices();

        //  fetchVolunteers();//API-NOT-READY


    }); //END of volunteers page prerequisites loading


    // filter volunteer
    $("#volunteer-list-page .ui-selectmenu .ui-icon-delete").on("click", function(event, ui) { //When user click on close select options
        var formData = readFormData("filter-volunteers");



        $.ajax({
            type: 'POST',
            url: baseURL + apiEndPoints.filterVolunteers,
            data: formData,
            contentType: 'application/json',
            success: function(response) {
                //4.Handle resposne
                // TO-DO need to populate from server response
            },
            error: function(error) {
                console.log('Error signing up: ' + readAPIError(error));
            }
        });

    });

    //SELECT-ALL Volunteers
    $("input[type='checkbox'].select-all").change(function() {
        console.log("Inside change");
        if ($(this).is(":checked")) {
            $(".individual-checkbox").prop("checked", true);
        } else {
            $(".individual-checkbox").prop("checked", false);
        }
    });

    //SELECT-ALL Volunteers Reverese  
    $(".individual-checkbox").change(function() {
        console.log("Inside change jill individual checkbox");
        var checkedCount = $(".individual-checkbox:checked").length;

        if (checkedCount === $(".individual-checkbox").length) {
            $("input[type='checkbox'].select-all").prop("checked", true);
        } else {
            $("input[type='checkbox'].select-all").prop("checked", false);
        }
    })


    //START of "create volunteer account"
    $("#signup-form").submit(function(event) {

        event.preventDefault();
        var formId = "signup-form";
        // 1. Validate form finally before submission
        var isValidForm = finalFormValidation(formId);
        // 2. Collect data from the form
        var formData = readFormData(formId);
        // 3. Proceed to send the POST request 
        console.log(isValidForm);
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


    $("#update-profile-form").submit(function(event) {
        event.preventDefault();
        var formId = "update-profile-form";
        // 1. Validate form finally before submission
        var isValidForm = finalFormValidation(formId);

        // 2. Collect data from the form
        const formData = {
            firstName: $("#update-firstName").val(),
            lastName: $("#update-lastName").val(),
            phone: $("#update-phoneNo").val(),
            preferred_categories: $("#update-select-services-menu").val(),
            preferred_locations: [$("#update-locations").val()], // Wrap single value inside an array
            preferred_channels: $("#update-select-consent").val()
        };

        //3.Loggedin User Id
        const authDetails = getUser();
        // 4. Proceed to send the POST request 
        console.log(formData);
        if (isValidForm) {
            $.ajax({
                type: 'PUT',
                url: baseURL + apiEndPoints.updateVlntrAccount,
                data: JSON.stringify(formData), // Convert object to JSON string
                headers: {
                    'Authorization': 'Bearer ' + authDetails.token,
                    'x-auth-token': authDetails.token
                },
                contentType: 'application/json', // Specify content type as JSON
                success: function(response) {
                    //4.Handle response
                    alert('Profile updated successfully');
                    $.mobile.changePage("#update-profile-page");
                },
                error: function(error) {
                    if (error.status === 400 && error.responseText.includes("email")) {
                        alert('Something went wrong!.');
                    } else {
                        alert('Error updating profile: ' + error.responseText);
                    }
                }
            });
        } else {
            $("html, body").animate({
                scrollTop: $("#" + formId).offset().top,
            }, 1000);
        }
    }); //END of update volunteer account


    function managePageActive(currentPage = '') {

        if (currentPage != '') {
            console.log($("#tab-" + currentPage));
            $("#" + currentPage + " #tab-" + currentPage).addClass("active");
        } else {
            $("footer ul[data-role='listview'] a").removeClass("active");
        }

    }
    //Services
    $(document).on("pageshow", "#public-home", function() {

        managePageActive("public-home");
        //Only logged in user can see this page 
        checkAuthentication();

        // Initial load of services
        fetchServices();

        // Search form submission
        $("#search-form").on("submit", function(e) {

            e.preventDefault();


            const dateRange = $("input[name='date-range']").val();
            var dateRangeString = "";
            if (dateRange.trim() === '') {
                console.log('The dateRange is empty.'); //keep calm
            } else {
                // Split the dateRange string into start and end date parts
                const [startDateStr, endDateStr] = dateRange.split(' - ');

                // Convert the start and end dates to the desired format
                const formattedStartDate = "startDate=" + startDateStr.split('/').reverse().join('-');
                const formattedEndDate = "endDate=" + endDateStr.split('/').reverse().join('-');

                // Create the final string
                dateRangeString = formattedStartDate + "&" + formattedEndDate;

                console.log(dateRangeString);
            }

            var query = $("#searchForCollapsibleSet").val();
            if (dateRangeString != '') {
                query = query + "/date?" + dateRangeString;
            }
            fetchServices(query);
        });

        // Function to fetch services based on query
        function fetchServices(query = "") {
            const authDetails = getUser(); //1.Token and Id will be returned

            $.ajax({
                type: 'GET',
                url: baseURL + apiEndPoints.services + `${query}`,
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + authDetails.token,
                    'x-auth-token': authDetails.token
                },
                success: function(services) {
                    console.log(services);
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

                // Convert locations array into a user-friendly list
                let locationDisplay = service.location ? "<li><p><strong>Location: </strong>" + service.location.locationName + " </p></li>" : "<p><strong>Location: N/A</strong></p>";
                //NEW-CHANGE-MAHAMMAD
                //let locationsList = service.locations.map(loc => `<li>${loc.locationName}</li>`).join('');

                // Category presentation
                let categoryDisplay = service.category ? `<p><strong>Category: </strong> ${service.category.categoryName}</p>` : "<p><strong>Category: N/A</strong></p>";

                //let categoryDisplay = service.category ? .categoryName; //NEW-CHANGE-MAHAMMAD
                //let categoryDisplay = "";

                var serviceCollapsible = `
        <div data-role="collapsible">
            <h3>
            ${service.serviceName}
            <p class="expirydate">${formatDateTime(service.expireDate,false)}</p>
            </h3>
            <p class="service-description">
            ${service.description}
            </p>
            <ul>
            <li>${categoryDisplay}</li>
            ${locationDisplay}
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
        const decison = window.confirm("Are you sure to logout?");
        if (decison) {
            localStorage.clear();
            alert('Logged out successfully!');
            $.mobile.changePage("#signin-page");
        } else {
            return true;
        }


    });


    //Navigate within Staff UI
    $('#edit-services-btn').click(() => {
        $("body").pagecontainer("change", "#staff-services-menu");
    });

    $('#staff-home-btn').click(() => {
        $("body").pagecontainer("change", "#staff-home-page");
    });

    $(document).on("pageshow", "#notification-page", function() {
        managePageActive("notification-page");
        //Only logged in user can see this page 
        checkAuthentication();

        fetchNotifications();

    })

    $(document).on("pageshow", "#staff-services-menu", function() {
        //managePageActive("notification-page");
        //Only logged in user can see this page 
        checkAuthentication();

        fetchLocations("staff");
        fetchAllServices("staff");

    })

    //Fetch Profile
    $(document).on("pagecreate", "#update-profile-page", function() {

        managePageActive("update-profile-page");

        //Only logged in user can see this page 
        checkAuthentication();

        //1.Fetch and populate locations
        fetchLocations("edit");
        //2.Fetch and populate categories
        fetchAllServices("edit");
        // ***IMP*** Calling  fetchProfile(); from the fetchServices --
        // -- function to make sure all services loaded/updated to DOM


    })

    //Loggedin User Info

    function getUser() {
        const token = localStorage.getItem('token');
        //const id = JSON.parse(localStorage.getItem('user'))._id;
        return { token };
    }
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjUwMzExM2YxZDZiMDlhMzhhNGRmNjU3IiwiYWNjdFR5cGUiOiJ2b2x1bnRlZXIifSwiaWF0IjoxNjk0NzAwMzMxLCJleHAiOjE2OTQ3MzYzMzF9.tWYLNYFu9XBUNs1Zuz74biZguW8xj_ufboU26TUAPxM
    function fetchProfile() {

        const authDetails = getUser(); //1.Token and Id will be returned
        console.log(authDetails);

        //  const id = authDetails.id;const formData = JSON.stringify({ id }); //API-UPDATE:no longer needed

        $.ajax({
            type: 'GET',
            url: baseURL + apiEndPoints.profile,
            //data: formData,//API-UPDATE:no longer needed
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + authDetails.token,
                'x-auth-token': authDetails.token
            },
            success: function(data) {
                // 2. Handle the response


                if (data) {

                    //const user = ; //API-UPDATE:Change in reposne format ->data[0].user
                    const response = data; //data[0].volunteer
                    //Saved data
                    $("#update-email").val(response.email);

                    $("#update-firstName").val(response.firstName);
                    $("#update-lastName").val(response.lastName);
                    $("#update-phoneNo").val(response.phone);



                    $.each(response.preferred_locations, function(index, value) {
                        $("#update-locations option[value='" + value._id + "']").prop("selected", true);
                    });
                    $.each(response.preferred_categories, function(index, value) {
                        $("#update-select-services-menu option[value='" + value._id + "']").prop("selected", true);
                    });
                    $.each(response.preferred_channels, function(index, value) {
                        $("#update-select-consent option[value='" + value + "']").prop("selected", true);
                    });
                    $("#update-locations,#update-select-services-menu,#update-select-consent").selectmenu().selectmenu("refresh");


                } else {

                    alert("Some error occurred");
                }





            },
            error: function(errors) {

                alert('Error: ' + errors.msg);
            }
        });

    }

    function fetchVolunteers() {
        authDetails = getUser();

        $.ajax({
            type: 'GET',
            url: baseURL + apiEndPoints.volunteers,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + authDetails.token,
                'x-auth-token': authDetails.token
            },
            contentType: 'application/json',
            success: function(response) {
                console.log(response);
                //4.Handle resposne
                // TO-DO need to populate from server response
            },
            error: function(error) {
                console.log('Error : ' + readAPIError(error));
            }
        });
    }

    function fetchNotifications() {

        const authDetails = getUser(); //localStorage.getItem('token');
        //const formData = JSON.stringify({ id });


        $.ajax({
            type: 'GET',
            url: baseURL + apiEndPoints.profile,
            contentType: 'application/json',
            headers: {
                'Authorization': 'Bearer ' + authDetails.token,
                'x-auth-token': authDetails.token
            },
            success: function(response) {
                var myNotifications = "";
                console.log(response);
                // console.log(response.firstName);
                // console.log(response.notifications);
                if (response.notifications && response.notifications.length > 0) {

                    response.notifications.forEach((item) => {
                        var notifSubject = item.subject;
                        var notifMessage = item.message;
                        var notifSentBy = "CQU Staff"; // item.createdBy;
                        var notifSentOn = formatDateTime(item.dateSent);
                        var notifSentThrough = item.channelType;
                        myNotifications += '<div class="each-notification">' +
                            '<p class = "notif-subject">' + notifSubject + '</p>' +
                            '<p class = "notif-message">' + notifMessage + '</p>' +
                            '<span class = "sent-timedate">' +
                            '<span class = "material-symbols-sharp"> schedule</span>' +
                            '<span class = "notif-datetime" >' + notifSentOn + '</span>' +
                            '</span >' +
                            '<span class = "sent-by">' +
                            '<span class = "material-symbols-sharp">account_circle</span>' +
                            '<span class = "notif-sentby">' + notifSentBy + '</span>' +
                            '</span></div>';
                    });
                    $(".voluntr-notif").html(myNotifications); //append to the parent div
                } else {

                    alert("Zero notifications found!");
                }

                //console.log(myNotifications);
            },
            error: function(error) {
                console.error("Error fetching notifications:", error);
            }
        });
    }


} //END of OnDeviceReady


//Fetch notifications sent to current user


function readAPIError(error) {
    errorMsg = error.responseJSON.errors[0].msg;
    return errorMsg;
}


function formatDateTime(dateString = '', includeTime = true) {

    if (dateString != '') {

        const dateObject = new Date(dateString);

        const day = dateObject.getDate();
        const month = dateObject.getMonth() + 1; //  +1 because months are zero-indexed
        const year = dateObject.getFullYear();
        const hour = dateObject.getHours();
        const minute = dateObject.getMinutes();
        const amOrPm = hour >= 12 ? "PM" : "AM";
        const formattedDate = `${day}/${month}/${year}`;

        if (includeTime) {
            const formattedTime = `${(hour % 12 || 12).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${amOrPm}`;
            return `${formattedDate} ${formattedTime}`;
        } else {
            return formattedDate;
        }
    } else {
        return "";
    }
}


function checkAuthentication() {

    const token = localStorage.getItem('token');
    //const user = localStorage.getItem('user');

    if (!token) {
        alert('You need to be logged in to access this page.');
        $.mobile.changePage("#signin-page");
    }
}