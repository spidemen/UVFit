
$(window).on("load", function () {
  console.log("send requst");
  $.ajax({
   url:'/account/user',
   type:'GET',
   headers: { 'x-auth': window.localStorage.getItem("authToken") },
   responseType: 'json',
   success: function(data){
         var username=data.fullName;
        $("#user").html(username);
        console.log("get date from page profile date="+data.email);
      }
   });
});
$("#viewData").click(function(){
     console.log("click view data button"); 
     $(".registerbox").css('display',"none");
       $(".view").css('display',"none");
       $(".error").css('display',"none");
});

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


$("table").on('click', 'tr', onCellClick);

function onCellClick() {

    let row = $(this); //get the jquery Object for the row
    var date; //An empty object to hold your data
    let temp;
    row.find('td').each(function(item) {
      temp = $(this);
      if(item==0)
      date = temp.text();
    });
   console.log(date);
   $(".RowDate").html(date);

   window.open("singleview?id="+date+"&deviceid=11f4baaef3445ff", 'newwindow', "height=600, width=800, top=30%,left=30%, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no");
   
}


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
  //      var responseHTMLType="Activies Type:";
      // var responseHTMLDate="";
      // var responseHTMDuration="Activity Duration:";
      // var responseHTMLUV="UV Exposure:";
      // var responseHTMLCalories=" Calories Burned:";
       var responseHTML="";
       responseHTML+="<tr>"+$("tr:first").html()+"</tr>";
      for(var  data of this.response.activities)
      {
           responseHTML+="<tr> ";
          responseHTML+="<td>"+data.date+"</td>";
          responseHTML+="<td>  "+data.duration+" </td>";
          responseHTML+="<td>"+data.uvExposure+"</td>";
          responseHTML+="<td>"+data.calories+"</td>";
           responseHTML+="</tr>"
      }
     
      // console.log(this.response.activities);
      $("table").html(responseHTML)
   // //   $("#type").html(responseHTMLType);
   //    $("#Date1").html(responseHTMLDate);
   //    $("#GPS").html(responseHTMDuration);
   //    $("#UV").html(responseHTMLUV);
   //    $("#speed").html(responseHTMLCalories);
      // console.log(responseHTML);

    }
    else
    {
      console.log("Error: view data "+this.status);
    }

}




