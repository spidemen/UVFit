
$("#register").click(function(){
	  console.log("click button update ");
      $(".registerbox").css('display',"block");
       $(".view").css('display',"none");
});

$("#viewData").click(function(){
     console.log("click button update ");
      $(".view").css('display',"block");
      $(".registerbox").css('display',"none");


});

function sendReqStore()
{

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", RegisterRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/test');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("store testing data");
  xhr.send();

}

$("#storeData").click(function(){
   
       sendReqStore();

});



function sendReqRegister() {
    var email = document.getElementById("email").value;
    var deviceId = document.getElementById("DeviceId").value;
    var deviceName = document.getElementById("DeviceName").value;

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", RegisterRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/devices/register');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log(email);
  xhr.send(JSON.stringify({email:email,deviceId:deviceId, deviceName:deviceName}));

}

function RegisterRespon(){

	var responseHTML="";
	if (this.status === 201) {
    if (this.response.registered) {
      responseHTML = "<span>";
      responseHTML += "Success register:  "+ this.response.message;
      responseHTML += "</span>"	
     // Change current location to the signin page.
     //  window.location = "index.html";
    } 
    else
    {
         // Use a span with dark red text for errors
      responseHTML = "<span>";
      responseHTML += "Error: "+this.response.message;
      responseHTML += "</span>"
    }
  }
  else
  {
  	 // Use a span with dark red text for errors
    responseHTML = "<span>";
    responseHTML += "Error: "+this.response.message;
    responseHTML += "</span>"
  }

   $(".error").html(responseHTML);
   $(".error").css('display',"block");

}

$("#submit").click(function(){
	 
       sendReqRegister();

});





function  sendReqViewData(){

  var email = "demo@email.com";
  var deviceId = "11f4baaef3445ff";
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", ViewDataRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/activities/user');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log(email);
  xhr.send(JSON.stringify({email:email,deviceId:deviceId}));

};
$("#viewbutton").click(function(){
       sendReqViewData();
});

function ViewDataRespon(){
    
    if(this.status === 200||this.status==201)
    {
      var responseHTMLType="Activies Type:";
      var responseHTMLDate="";
<<<<<<< HEAD
      var responseHTMLGPS="GPS location:";
      var responseHTMLUV="UV data:";
      var responseHTMLspeed="Speed:";
=======
      var responseHTMLGPS="GPS location::";
      var responseHTMLUV="UV data::";
>>>>>>> ea997c5249d3dd39219a1eeafcf7ee67c30cb470
      for(var  data of this.response.activities)
      {
          for(var i=0;i<data.lons.length;i++)
          {
          responseHTMLType+="<p>"+data.type+"</p>";
          responseHTMLDate+="<p>"+data.date+"</p>";
          responseHTMLGPS+="<p>  "+data.lons[i]+"  "+data.lats[i]+" </p>";
<<<<<<< HEAD
          responseHTMLUV+="<p>"+data.uv[i]+"</p>";
          responseHTMLspeed+="<p>"+data.speed[i]+"</p>";

=======
          responseHTMLUV+="<p>"+data.uv[i]+"</p>"
>>>>>>> ea997c5249d3dd39219a1eeafcf7ee67c30cb470
         }
      }

      $("#type").html(responseHTMLType);
      $("#Date1").html(responseHTMLDate);
      $("#GPS").html(responseHTMLGPS);
      $("#UV").html(responseHTMLUV);
      $("#speed").html(responseHTMLspeed);
      console.log("view data");

    }
    else
    {
      console.log("Error: view data "+this.status);
    }

}




