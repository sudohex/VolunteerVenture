/*
App: Volunteer Venture
Main JS 
Created: July 17, 2023
Authors: Pyae Phyo Kyaw, Briana Loughlin, Mahammad Juber Shaik
*/

document.addEventListener('deviceready', onDeviceReady, false);
$(document).ready(function(){
  onDeviceReady();
})

function onDeviceReady() {
  $(document).on("pagecreate", "#admin-login", function() {
    console.log('Admin login page created');
    $("#admin-login-form button").click(function(e) {
        e.preventDefault();
        alert("ADMIN ATTEMPT TO LOGIN");
    });
});
}
