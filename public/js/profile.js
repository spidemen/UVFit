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
            $("#thresholdFormMessage").html(jqXHR.responseJSON.message);
        },
        error: function(jqXHR, textStatus, errorThrown){
            $("#thresholdFormMessage").html("Error: " + jqXHR.responseJSON.message);
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
        data: {'deviceId': deviceId},
        responseType: 'json',
        success: function(data, textStatus, jqXHR){
            if(jqXHR.status == 200) {
                //console.log(data);
                /*Parse returned data for different days' info*/
                currDate = new Date();
                var daysInfo = [];
                for (weatherInfo of data.weather.list) {
                    console.log(weatherInfo);
                    var date = new Date(weatherInfo.dt*1000);
                    dd = date.getDate();
                    mm = date.getMonth()+1;
                    yyyy = date.getFullYear();
                    minTemp = weatherInfo.main.temp_min;
                    maxTemp = weatherInfo.main.temp_max;
                    rain = parseFloat(weatherInfo.hasOwnProperty("rain") ? (weatherInfo.rain.hasOwnProperty("3h") ? weatherInfo.rain["3h"] : 0) : 0);
                    snow = parseFloat(weatherInfo.hasOwnProperty("snow") ? (weatherInfo.snow.hasOwnProperty("3h") ? weatherInfo.snow["3h"] : 0) : 0);
                    if(daysInfo.length == 0){
                        daysInfo.push({
                            "dd":dd, 
                            "mm":mm, 
                            "yyyy":yyyy,
                            "minTemp":minTemp,
                            "maxTemp":maxTemp,
                            "descriptions":[],
                            "windSpeeds":[],
                            "rainVolume":0,
                            "snowVolume":0
                        });
                    }
                    daysInfoBack = daysInfo[daysInfo.length-1];
                    if (daysInfoBack.dd == dd) {
                        if(daysInfoBack.minTemp > minTemp) {
                            daysInfoBack.minTemp = minTemp;
                        }
                        if(daysInfoBack.maxTemp < maxTemp) {
                            daysInfoBack.maxTemp = maxTemp;
                        }
                        daysInfoBack.descriptions.push(weatherInfo.weather[0].description);
                        daysInfoBack.windSpeeds.push(weatherInfo.wind.speed);
                        daysInfoBack.rainVolume += rain;
                        daysInfoBack.snowVolume += snow;
                    }
                    else {
                        daysInfo.push({
                            "dd":dd, 
                            "mm":mm, 
                            "yyyy":yyyy,
                            "minTemp":minTemp,
                            "maxTemp":maxTemp,
                            "descriptions": [ weatherInfo.weather[0].description ],
                            "windSpeeds": [ weatherInfo.wind.speed ],
                            "rainVolume": rain,
                            "snowVolume": snow
                        });
                    }
                }
                for (day of daysInfo) {
                    day.description = mode(day.descriptions);
                }
                console.log(daysInfo);
                
                /*Update HTML*/
                $("#forecastCityName").html(data.weather.city.name);
                $("#forecastLatLon").html(data.lat + ", " + data.lon);
                for (day=0; day < 5; day++) {
                    daySel = "#day"+day;
                    $(daySel+"Date").html(daysInfo[day].mm + "/" + daysInfo[day].dd + "/" + daysInfo[day].yyyy);
                    $(daySel+"Description").html(daysInfo[day].description);
                    $(daySel+"Temp").html(daysInfo[day].minTemp + " " + daysInfo[day].maxTemp);
                    if(daysInfo[day].rainVolume > 0) {
                        $(daySel+"Rain").html("Volume of Rain: " + daysInfo[day].rainVolume);
                    }
                    if(daysInfo[day].snowVolume > 0) {
                        $(daySel+"Snow").html("Volume of Snow: " + daysInfo[day].snowVolume);
                    }
                }
                
                $("#forecastFormMessage").hide();
            }
            else {
                $("#forecastFormMessage").html(jqXHR.responseJSON.message).show();
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            $("#forecastFormMessage").html("Error: " + jqXHR.responseJSON.message);
        }
    });

    $(".forecastForm").css('display',"block");
});

function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
/************************************************************************/

/* single view */

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

   window.open("singleview?id="+date+"&deviceid=agagag", 'newwindow', "height=600, width=800, top=30%,left=30%, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=no");
   
}

/*   This API Just for test      */
$("#storeData").click(function(){
   
       sendReqStore();

});

function sendReqStore()
{

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", RegisterRespon);
  xhr.responseType = "json";
  xhr.open("GET", '/test');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("store testing data");
  xhr.send();

}

/* -----------------------------------------*/

/* register a device */
$("#submit").click(function(){
   
       sendReqRegister();

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
/*------------------------------------------------------*/
/*list view all the activities   */
$("#listview").click(function(){
    $("#summary").css('display',"block");
   $("#summary").html("Following is the list view all the activities");
    $(".rightbar > div").css('display', "none");
    $(".view").css('display',"block");
    sendReqViewData();
});
function  sendReqViewData(){

 // var email = "demo@email.com";
 //  var deviceId = "11f4baaef3445ff";
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", ViewDataRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/activities/list');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("send "+email);
  xhr.send(JSON.stringify({email:email,deviceId:deviceId}));

};

function ViewDataRespon(){
    
    if(this.status === 200||this.status==201)
    {
  
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
    }
    else
    {
      console.log("Error: view data "+this.status);
    }

}
/*****************************************************/

/*summary view  */

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


/*all user view */
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

/*------------------------------------------------------------*/


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




