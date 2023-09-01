/*
App: Volunteer Venture
Main JS 
Created: July 17, 2023
Authors: Pyae Phyo Kyaw, Briana Loughlin, Mahammad Juber Shaik
*/

// document.addEventListener('deviceready', onDeviceReady, false);
$(document).ready(onDeviceReady)
function onDeviceReady() {
  //Sign in submit
  $("#signin-form").submit(function (e) {
    e.preventDefault();

    // 1. Collect data from the form
    const email = $("#signin-form input[name='email']").val();
    const password = $("#signin-form input[name='password']").val();
    if(!email || !password){
      alert('Please fill in all the fields.');
      return;
    }
    // 2. Send the POST request
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/signin', // update this URL if it's different
      data: JSON.stringify({ email, password }),
      contentType: 'application/json',
      success: function (response) {
        // 3. Handle the response

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));


        alert('Successfully signed in!');
        $.mobile.changePage("#public-home");

      },
      error: function (error) {
        alert('Error signing in: ' + error.responseJSON.message);
      }
    });
  });
  //Sign up initialize
  $(document).on("pageshow", "#signup-page", function () {
    // Fetch and populate locations
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000/api/locations',
      dataType: 'json',
      success: function (data) {
        var locationsOptions = '<option value="">Select all that apply</option>';
        data.forEach(function (location) {
          locationsOptions += '<option value="' + location._id + '">' + location.locationName + '</option>';
        });
        $('select[name="locations"]').html(locationsOptions).selectmenu("refresh");
      }
    });
    // Fetch and populate categories
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000/api/categories',
      dataType: 'json',
      success: function (data) {
        var categoriesOptions = '<option value="">Select all that apply</option>';
        data.forEach(function (category) {
          categoriesOptions += '<option value="' + category._id + '">' + category.categoryName + '</option>';
        });
        $('select[name="services"]').html(categoriesOptions).selectmenu("refresh");
      }
    });
     //Sign up submit
  $("#signup-form").submit(function (e) {
    e.preventDefault();

    var email = $('#email').val();
    var password = $('#password').val();
    var firstName = $('#firstName').val();
    var lastName = $('#lastName').val();
    var phoneNo = $('#phoneNo').val();
    var isSMSOn = $('#select-consent option[value="isSMSOn"]').is(':selected');
    var isEmailOn = $('#select-consent option[value="isEmailOn"]').is(':selected');
    var locations = $('select[name="locations"]').val();
    var categories = $('select[name="services"]').val();

    // Validation
    if (!email || !password || !firstName || !lastName || !phoneNo) {
      alert('Please fill in all the fields.');
      return;
    }

    if (password.length < 8) {
      alert('Password should be at least 8 characters.');
      return;
    }

    if (!locations || !locations.length) {
      alert('Please select your preferred locations.');
      return;
    }

    if (!categories || !categories.length) {
      alert('Please select your preferred service categories.');
      return;
    }

    var formData = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      phoneNo: phoneNo,
      isSMSOn: isSMSOn,
      isEmailOn: isEmailOn,
      preferences: {
        locations: locations,
        categories: categories
      }
    };

    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/api/signup',
      data: JSON.stringify(formData),
      contentType: 'application/json',
      success: function (response) {
        alert('Successfully signed up!');
        $.mobile.changePage("#signin-page");
      },
      error: function (error) {
        if (error.status === 400 && error.responseText.includes("email")) {
          alert('Email already exists.');
        } else {
          alert('Error signing up: ' + error.responseText);
        }
      }
    });
  });
  });
  //Services
  $(document).on("pageshow", "#public-home", function () {
    //Only logged in user can see this page 
    checkAuthentication();

    // Initial load of services
    fetchServices();

    // Search form submission
    $("#search-form").on("submit", function (e) {
      e.preventDefault();
      var query = $("#searchForCollapsibleSet").val();
      fetchServices(query);
    });

    // Function to fetch services based on query
    function fetchServices(query = "") {
      $.ajax({
        type: 'GET',
        url: `http://localhost:3000/api/services?q=${query}`,
        dataType: 'json',
        success: function (services) {
          renderServices(services);
        },
        error: function (error) {
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
        let locationsList = service.locations.map(loc => `<li>${loc.locationName}</li>`).join('');

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
  $(".signout-btn").click(function (e) { 
    e.preventDefault();
    localStorage.clear();
    alert('Logged out successfully!');
    $.mobile.changePage("#signin-page");

  });

  //Notifications 
  
  //Navigate within Staff UI
  $('#edit-services-btn').click(() => {
		$("body").pagecontainer("change", "#staff-services-menu");
    });

  $('#staff-home-btn').click(() => {
    $("body").pagecontainer("change", "#staff-home-page");
  });
  
}
function checkAuthentication() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
      alert('You need to be logged in to access this page.');
      $.mobile.changePage("#signin-page");
  }
}
