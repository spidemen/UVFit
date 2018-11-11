// Initiates an Ajax call to a POST endpoint for creating user account
// with email and password
function sendReqCreateAccount() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // 1. Create the XMLHttpRequest object, register the load event
    // listener, and set the response type to JSON 
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", createAccountResponse);
    xhr.responseType = "json";

    // x. Create the query string with email = the user entered email address
    // and endcode the emailAddress
    //var queryString = "carrier=" + encodeURIComponent(carrier) +
    //                  "&service=" + encodeURIComponent(service);

    // 2. Open a POST connection to the desired endpoint with the 
    // query string
    xhr.open("POST", '/account/create');

    // 4. Send the request
	xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({email:email, password:password}));
};

// Response listener for the Ajax call for request to create account
function createAccountResponse() {
    //var responseDiv = document.getElementById('ServerResponse');
    //var responseHTML;

    // 200 is the response code for a successful POST request
    if (this.status === 201) {
		console.log("message"+this.response.message);
		alert("message"+this.response.message);
        // Use materialize's collection class to display the shipping results
        //responseHTML = "<ul class='collection'>";
        /* for (var carrier in this.response.costs) {
            responseHTML += "<li class='collection-item'>" + carrier.toUpperCase() + " : ";
            if (this.response.costs[carrier] === "na") {
                responseHTML += "Service unavailable";
            }
            else {
                responseHTML += "$" + parseFloat(this.response.costs[carrier]).toFixed(2);
            }
            responseHTML += "</li>";
        }
        responseHTML += "</ul>" */
    }
    else {
		console.log("message"+this.response.message);
		alert("message"+this.response.message);
        // Use a span with dark red text for errors
        /* responseHTML = "<span class='red-text text-darken-2'>";
        responseHTML += "Error: " + this.response.error;
        responseHTML += "</span>" */
    }

    // Update the response div in the webpage and make it visible
    responseDiv.style.display = "block";
    responseDiv.innerHTML = responseHTML;
};

$("#submit").click(function(){

       sendReqLogin();

});

//document.getElementById("getShippingCosts").addEventListener("click", sendReqForShippingCosts);

