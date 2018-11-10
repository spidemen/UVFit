
$("#register").click(function(){
	  console.log("click button update ");
      $(".registerbox").css('display',"block");
});

function sendReqRegister() {
    var email = document.getElementById("email").value;
    var deviceId = document.getElementById("DeviceId").value;
    var deviceName = document.getElementById("DeviceName").value;

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", RegisterRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/register');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log(email);
  xhr.send(JSON.stringify({email:email,deviceId:deviceId, deviceName:deviceName}));
}

function RegisterRespon(){

	var responseHTML="";
	if (this.status === 201) {
    if (this.response.registered) {

      responseHTML = "<span>";
      responseHTML += "Success register: deviceId "+ this.response.deviceId;
      responseHTML += "</span>"	

      // Change current location to the signin page.
     //  window.location = "index.html";
    } 
    else
    {
         // Use a span with dark red text for errors
      responseHTML = "<span>";
      responseHTML += "Error: internal" ;
      responseHTML += "</span>"
    }
  }
  else
  {
  	 // Use a span with dark red text for errors
    responseHTML = "<span>";
    responseHTML += "Error: ";
    responseHTML += "</span>"
  }

   $(".error").html(responseHTML);
    $(".error").css('display',"block");

}

$("#submit").click(function(){
	 
      sendReqRegister();

});




