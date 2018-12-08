var username;
var email;
var deviceId;
var apikey;
$(window).on("load", function () {
  $.ajax({
   url:'/account/user',
   type:'GET',
   headers: { 'x-auth': window.localStorage.getItem("authToken") },
   responseType: 'json',
   success: function(data){
          username=data.fullName;
          email=data.email;
		$("div.form #email2").attr("value",email); //to auto-fill update account form
		$("div.form #fullName").attr("value",username); //to auto-fill update account form
          deviceId=data.devices[0].deviceId; // if place before lines 14 & 15, prevented update account form auto-fill
          apikey=data.devices[0].apikey;
        $("#user").html(username);
		console.log("get date from page profile date="+data.email);
		

        console.log("get date from page profile deviceid="+deviceId+"  apikey="+apikey);
      },
    error: function(jqXHR, textStatus, errorThrown){
        var response = JSON.parse(jqXHR.responseText);
       console.log("Fail get data "+response.message);
    }
   });
});

$("#register").click(function(){
    $(".rightbar > div").css('display', "none");
    $(".registerbox").css('display',"block");
});

// $("#viewData").click(function(){
//      console.log("click button update ");
//       $(".view").css('display',"block");
//       $(".registerbox").css('display',"none");

// });

$("#updateAccount").click(function(){
	$(".rightbar > div").css('display', "none");
	$(".updateAccountForm").css('display', "inline-block");
});

/***************************** UV Threshold *****************************/
$("#setUvThreshold").click(function(){
    $(".rightbar > div").css('display', "none");
    $(".thresholdForm").css('display',"block");
});

$("#submitThres").click(function(){
    /*Validate Input*/
    thresInput = parseInt($("#uvThres").val());
    if (thresInput < 0) {
        $("#thresholdFormMessage")
            .html("Please input a positive integer!")
            .css('display',"block")
        return;
    }
    
    /*POST: push threshold to database and device*/
    $.ajax({
        url:'/uvThreshold',
        type:'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: {'deviceId':deviceId, 'uvThreshold':thresInput},
        responseType: 'json',
        success: function(data, textStatus, jqXHR){
            var response = JSON.parse(jqXHR.responseText);
            $("#thresholdFormMessage").html(response.message);
        },
        error: function(jqXHR, textStatus, errorThrown){
            var response = JSON.parse(jqXHR.responseText);
            $("#thresholdFormMessage").html("Error: " + response.message);
        }
    });
});
/************************************************************************/

/*************************** Weather Forecast ***************************/
$("#getForecast").click(function(){
    $(".rightbar > div").css('display', "none");
    
    /*GET: User's lat/lon*/
    $.ajax({
        url:'/weather',
        type:'GET',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        responseType: 'json',
        success: function(data, textStatus, jqXHR){
            var response = JSON.parse(jqXHR.responseText);
            $("#thresholdFormMessage").html(response.message);
        },
        error: function(jqXHR, textStatus, errorThrown){
            var response = JSON.parse(jqXHR.responseText);
            $("#thresholdFormMessage").html("Error: " + response.message);
        }
    });

    $(".forecastForm").css('display',"block");
});

function userLatLonHandler(){
    if (this.status === 201) {
        var lat = this.response.activities.lat[this.response.activities.lat.length-1];
        var lon = this.response.activities.lon[this.response.activities.lon.length-1];
        
        
    }
}
/************************************************************************/

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

 // var email = "demo@email.com";
 //  var deviceId = "11f4baaef3445ff";
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", ViewDataRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/activities/user');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("send "+email);
  xhr.send(JSON.stringify({email:email,deviceId:deviceId}));

};
$("#listview").click(function(){
    $("#summary").css('display',"block");
   $("#summary").html("Following is the list view all the activities");
    $(".rightbar > div").css('display', "none");
    $(".view").css('display',"block");
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
       // responseHTML+="<tr>"+$("tr:first").html()+"</tr>";
        responseHTML+="<tr> <td> Date: </td>  <td> Activity Duration:  </td>  <td>  Calories Burned:  </td>  <td>   UV exposure:   </td>  </tr>";
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


$("#summaryview").click(function(){
   $("#summary").css('display',"block");
   $("#summary").html("Following  is the last 7 day total activities summary");
    $(".rightbar > div").css('display', "none");
    $(".view").css('display',"block");

    // $("#table2").css('display', "inline-block");
    // $("#table1").css('display',"none");
    sendReqSummaryView();
});

function sendReqSummaryView(){

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", ViewSummaryDataRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/activities/summary');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("send summary view"+email);
  xhr.send(JSON.stringify({email:email,deviceId:deviceId}));
     
}

function ViewSummaryDataRespon(){

     if(this.status === 200||this.status==201)
    {
  
      var responseHTML=" <tr>  <td> Total  Duration:  </td>  <td>  Total Calories Burned:  </td>  <td>  Total  UV exposure:  </td> </tr>";
    //   responseHTML+="<tr>"+$("tr:first").html()+"</tr>";
         var data=this.response;
      // for(var  data of this.response.activities;)
      // {
           responseHTML+="<tr> ";
       //   responseHTML+="<td>"+data.date+"</td>";
          responseHTML+="<td>  "+data.totalduration+" </td>";
          responseHTML+="<td>"+data.totaluv+"</td>";
          responseHTML+="<td>"+data.totalcalories+"</td>";
           responseHTML+="</tr>"
      // }
     
      $("table").html(responseHTML)
 
    }
    else
    {
      console.log("Error: view data "+this.status);
    }

    $("tr").css("color","black");
     $("tr").css("text-decoration","none");
}


$("#allUserView").click(function(){
    $("#summary").css('display',"block");
   $("#summary").html("In the last 7 day, All user avg activities view blow:");
    $(".rightbar > div").css('display', "none");
    $(".view").css('display',"block");


     sendReqAllUserView();
});

function sendReqAllUserView(){

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", ViewAllUserDataRespon);
  xhr.responseType = "json";
  xhr.open("GET", '/activities/all');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("send all user view"+email);
  xhr.send();
     
}
function ViewAllUserDataRespon(){


   

    if(this.status === 200||this.status==201)
    {
  
      var responseHTML=" <tr>  <td> UserName </td> <td> DeviceId </td>  <td> Total Activities</td>  <td>Avg distancee</td> <td> Avg  Duration:  </td>  <td>  Avg Calories Burned:  </td>  <td>  Avg  UV exposure:  </td>  </tr>";
    //   responseHTML+="<tr>"+$("tr:first").html()+"</tr>";
         // var data=this.response;
       for(var  data of this.response.user)
       {
           responseHTML+="<tr> ";
       //   responseHTML+="<td>"+data.date+"</td>";
          responseHTML+="<td>  "+data.userName+" </td>";
           responseHTML+="<td>  "+data.deviceId+" </td>";
          responseHTML+="<td>  "+data.totalactivities+" </td>";
           responseHTML+="<td>  "+data.avgdistance+" </td>";
          responseHTML+="<td>  "+data.avgduration+" </td>";
          responseHTML+="<td>"+data.avgcalories+"</td>";
          responseHTML+="<td>"+data.avguv+"</td>";
           responseHTML+="</tr>"
       }
     
      $("table").html(responseHTML)
      console.log(this.response.user);
 
    }
    else
    {
      console.log("Error: view data "+this.status);
    }

    $("tr").css("color","black");
     $("tr").css("text-decoration","none");
}




// Update Account
var checksumbit=document.getElementById("submitUpdate");
var savetable=document.getElementById("formErrors");

function  CheckInput() {

    var fullname=document.getElementById("fullName");
    var email=document.getElementById("email2");
    var oldpassword=document.getElementById("oldpassword"); 
	var newpassword=document.getElementById("newpassword");
   
    /* 123@aJ11ljllkjljj   */
	var tableHTML = "<ul>";
	var flag=0;
	savetable.style.display="none";
    if(fullname.value.length<1){
    	flag=1;
    	fullname.classList.add("error");
    	savetable.style.display="block";
    	tableHTML+="<li>Missing full name.</li>";
    }
    else{
    	fullname.classList.remove("error");
    }
	
    var re=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    if(!re.test(email.value)){ 
       flag=1;
       email.classList.add("error");
       savetable.style.display="block";
       tableHTML+="<li>Invalid or missing email address.</li>";
	}
	else{
		email.classList.remove("error");
	}

	var oldpw=oldpassword.value;
	var newpw=newpassword.value;
	if(oldpw === newpw){
		flag=1;
		savetable.style.display="block";
		tableHTML+="<li>Old password and new password must not match.</li>";
	}
	
	/* if(oldpw.length<10||oldpw.length>20){
		flag=1;
		savetable.style.display="block";
		tableHTML+="<li>Old password must be between 10 and 20 characters.</li>";
	} */
	if(newpw.length<10||newpw.length>20){
		flag=1;
		savetable.style.display="block";
		tableHTML+="<li>New password must be between 10 and 20 characters.</li>";
	}

	var relow=/[a-z]/;
	/* if(!oldpw.match(relow)){
		flag=1;  
		savetable.style.display="block";
		tableHTML+="<li>Old password must contain at least one lowercase character.</li>";
	} */
	if(!newpw.match(relow)){
		flag=1;  
		savetable.style.display="block";
		tableHTML+="<li>New password must contain at least one lowercase character.</li>";
	}

	var reup=/[A-Z]/;
	/* if(!oldpw.match(reup)){
		flag=1;  
		savetable.style.display="block";
		tableHTML+="<li>Old password must contain at least one uppercase character.</li>";
	} */
	if(!newpw.match(reup)){
		flag=1;  
		savetable.style.display="block";
		tableHTML+="<li>New password must contain at least one uppercase character.</li>";
	}

	var reN=/[0-9]/;
	/* if(!oldpw.match(reN)){
		flag=1;  
		savetable.style.display="block";
		tableHTML+="<li>Old password must contain at least one digit.</li>";
	} */
	if(!newpw.match(reN)){
		flag=1;  
		savetable.style.display="block";
		tableHTML+="<li>New password must contain at least one digit.</li>";
	}
	
	if(flag==1){
		newpassword.classList.add("error");
	}
	else{
		newpassword.classList.remove("error");
	}
		
    var confirm=document.getElementById("passwordConfirm").value;
    if(confirm!=newpw){
		document.getElementById("passwordConfirm").classList.add("error");
		savetable.style.display="block";
		tableHTML+="<li>New password and confirmation password don't match.</li>";
    }
    else{
        document.getElementById("passwordConfirm").classList.remove("error");
    }

    savetable.innerHTML = tableHTML;
	
	if(!flag){

		//var email = document.getElementById("email").value;
		//var fullname = document.getElementById("fullName").value;
		//var newpassword = document.getElementById("newpassword").value;
		var xhr = new XMLHttpRequest();
		var token=window.localStorage.getItem("authToken");
		xhr.addEventListener("load", UpdateAccountResponse);
		xhr.responseType = "json";
		xhr.open("POST", '/account/update');
		xhr.setRequestHeader("Content-type", "application/json");
		console.log(JSON.stringify({email:email.value, name:fullname.value, newPasswordHash:newpassword.value, passwordHash:oldpassword.value, token:token}));
		xhr.send(JSON.stringify({email:email.value, name:fullname.value, newPasswordHash:newpassword.value, passwordHash:oldpassword.value, token:token}));
	}
}

function UpdateAccountResponse(){
	console.log("update account response complete");
	//console.log("status="+this.status);
	// Decode a JWT
	/* var decoded = jwt.decode(token, secret);, 
	console.log("Decoded payload: " + decoded.username); */

/* 	if (this.status === 201){
		alert("Success account updated");
		window.location = "profile";
	}
	else{
        //  savetable.style.display="block";
        $("#formErrors").css('display',"block");
        var tableHTML = "<p>"+this.response.message+"</p>";
        savetable.innerHTML = tableHTML;
        //$("#formErrors").html(tableHTML);
        console.log(this.response.message); */
        
   // }  
}

checksumbit.addEventListener("click", CheckInput);




