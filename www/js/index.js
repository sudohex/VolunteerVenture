/*
App: Volunteer Venture
Main JS 
Created: July 17, 2023
Authors: Pyae Phyo Kyaw, Briana Loughlin, Mahammad Juber Shaik
*/

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

    $('#CreateNew').click(() => {
		$("body").pagecontainer("change", "#createAcct");
    });

    /* to be removed, just using while developing UI */
    $('#temp-button').click(() => {
		$("body").pagecontainer("change", "#log-in");    
    });
    $('#save-account').click(() => {
		$("body").pagecontainer("change", "#public-home"); 
    });
    $('#messages').click(() => {
		$("body").pagecontainer("change", "#notif-page");
    });
    $('#manageAcct').click(() => {
		$("body").pagecontainer("change", "#manage-acct-page");
    });
    

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}
