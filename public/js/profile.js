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
		$("div.form #oldemail").attr("value",email); //to auto-fill update account form
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

/*replace device*/
$("#replaceDevice").click(function(){
    $(".rightbar > div").css('display', "none");
    $(".Replacedevice").css('display',"block");
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
                    var date = new Date(weatherInfo.dt*1000);
                    var dd = date.getDate();
                    var mm = date.getMonth()+1;
                    var yyyy = date.getFullYear();
                    var minTemp = weatherInfo.main.temp_min;
                    var maxTemp = weatherInfo.main.temp_max;
                    var rain = parseFloat(weatherInfo.hasOwnProperty("rain") ? (weatherInfo.rain.hasOwnProperty("3h") ? weatherInfo.rain["3h"] : 0) : 0);
                    var snow = parseFloat(weatherInfo.hasOwnProperty("snow") ? (weatherInfo.snow.hasOwnProperty("3h") ? weatherInfo.snow["3h"] : 0) : 0);
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
                            "snowVolume":0,
                            "uvIndex":0
                        });
                    }
                    var daysInfoBack = daysInfo[daysInfo.length-1];
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
                            "snowVolume": snow,
                            "uvIndex":0
                        });
                    }
                }
                /* Insert UV index into correct day*/
                for (uvInfo of data.uvFore) {
                    var date = new Date(uvInfo.date*1000);
                    var dd = date.getDate();
                    for (day of daysInfo) {
                        if (day.dd == dd) {
                            day.uvIndex = uvInfo.value;
                        }
                        else if (day.dd == new Date(data.uvCurr.date*1000).getDate()) {
                            day.uvIndex = data.uvCurr.value;
                        }
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
                    $(daySel+"Temp").html("Temp: " + daysInfo[day].minTemp + " - " + daysInfo[day].maxTemp);
                    if(daysInfo[day].rainVolume > 0) {
                        $(daySel+"Rain").html("Volume of Rain: " + daysInfo[day].rainVolume);
                    }
                    if(daysInfo[day].snowVolume > 0) {
                        $(daySel+"Snow").html("Volume of Snow: " + daysInfo[day].snowVolume);
                    }
                    $(daySel+"UvIndex").html("UV Index: " + daysInfo[day].uvIndex);
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

/***********Device replace***********************************************/

$("#Change").click(function(){

    sendReqDeviceChange();
});
function sendReqDeviceChange(){
 
  var olddeviceId=$("#oldDevice").val();
  var newDeviceId=$("#newDevice").val();
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", DeviceChangeRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/devices/change');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("send summary view"+olddeviceId+"  type= "+newDeviceId+"  email"+email);

  xhr.send(JSON.stringify({email:email,newdeviceId:newDeviceId,olddeviceId:olddeviceId}));    
}
function DeviceChangeRespon(){

     if(this.status === 200||this.status==201)
    {
           alert("Success Change type."+this.response.message);
      
    }
    else
    {
         alert("Fail "+this.response.message);
    }

}

/********************************************************************/
/* single view ***********************************************************/

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

/**********************************************************************/

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


/* register a device *****************************************************************/

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

/*list view all the activities   **************************************************************/

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

/*summary view  *******************************************************/

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

/**************************************************************************************************/


/*all user view ***************************************************************************************/

/*all user view */
$("#allUserView").click(function(){
    $("#summary").css('display',"block");
    $("#summary").html("In the last 7 day, All user avg activities view blow:");
    $(".rightbar > div").css('display', "none");
    $(".view").css('display',"block");
      $("table").html("This would be very slow, please wait...............")

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
           if(data.userName)
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
           responseHTML+="</tr>";
         }
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


/****************************Local user view ****************************************/
$("#localUserView").click(function(){
    $("#summary").css('display',"block");
    $("#summary").html("In the last 7 day,  geographically local  user avg activities view blow (Notice Group number means, they are local user on specific area:");
    $(".rightbar > div").css('display', "none");
    $(".view").css('display',"block");
       $("table").html("This would be very slow, please wait...............")
      sendReqLocalUserView();
});
function sendReqLocalUserView(){

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", ViewLocalUserDataRespon);
  xhr.responseType = "json";
  xhr.open("GET", '/activities/local');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("send all user view"+email);
  xhr.send();
     
};
function ViewLocalUserDataRespon(){

    if(this.status === 200||this.status==201)
    {
  
      var responseHTML=" <tr>  <td> Group </td> <td> UserName </td> <td> DeviceId </td>  <td> Total Activities</td>  <td>Avg distancee</td> <td> Avg  Duration:  </td>  <td>  Avg Calories Burned:  </td>  <td>  Avg  UV exposure:  </td>  </tr>";
       //   responseHTML+="<tr>"+$("tr:first").html()+"</tr>";
         // var data=this.response;
         // this.response.user.sort(customfunction);
         var test=this.response.user;
         // test.sort(sort_by('group', true, parseInt));
         sort(test);
       for(var  i =0;i<test.length;i++)
       {
           data=test[i];  
          if(data.userName){
             responseHTML+="<tr> ";
         //   responseHTML+="<td>"+data.date+"</td>";
           responseHTML+="<td>  "+data.group+" </td>";
            responseHTML+="<td>  "+data.userName+" </td>";
             responseHTML+="<td>  "+data.deviceId+" </td>";
            responseHTML+="<td>  "+data.totalactivities+" </td>";
             responseHTML+="<td>  "+data.avgdistance+" </td>";
            responseHTML+="<td>  "+data.avgduration+" </td>";
            responseHTML+="<td>"+data.avgcalories+"</td>";
            responseHTML+="<td>"+data.avguv+"</td>";
             responseHTML+="</tr>";
         }
       }
       console.log(test);
     
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
var sort_by = function(field, reverse, primer){

   var key = primer ? 
       function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;
   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     } 
}
function sort( user) {

     for(var i=0;i<user.length;i++){
          var  temp=user[i];
          var j=i-1;
          while(j>=0&&parseInt(user[j].group)>parseInt(temp.group)) {
            // console.log(parseInt(user[j].group)+".  "+parseInt(temp.group));
               user[j+1]=user[j];
               j--;
          }
          // console.log("i ="+i+"  j="+j);
          user[j+1]=temp;
     }
   
}

/*------------------------------------------------------------*/

/***********************************************************************************/

// Update Account
var checksumbit=document.getElementById("submitUpdate");
var savetable=document.getElementById("formErrors");

function  CheckInput() {

    var fullname=document.getElementById("fullName");
    var oldemail=document.getElementById("oldemail");
	var newemail=document.getElementById("newemail");
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
    if(!re.test(newemail.value)){ 
       flag=1;
       newemail.classList.add("error");
       savetable.style.display="block";
       tableHTML+="<li>Invalid or missing email address.</li>";
	}
	else{
		newemail.classList.remove("error");
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
		
		var xhr = new XMLHttpRequest();
		var token=window.localStorage.getItem("authToken");
		xhr.addEventListener("load", UpdateAccountResponse);
		xhr.responseType = "json";
		xhr.open("POST", '/account/update');
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.setRequestHeader('x-auth', token);
		xhr.send(JSON.stringify({email:oldemail.value, newemail:newemail.value, name:fullname.value, newpassword:newpassword.value, password:oldpassword.value, token:token}));
	}

	function UpdateAccountResponse(){
		//console.log("status="+this.status+" response " + this.res.message);
		// Decode a JWT
		/* var decoded = jwt.decode(token, secret);, 
		console.log("Decoded payload: " + decoded.username); */

		if (this.status === 201){
			$("#formErrors").css('display',"block");
			$("#formErrors").html(this.response.message);
			$("div.form #oldemail").attr("value",oldemail.value); //to auto-fill update account form
			$("div.form #newemail").attr("value",newemail.value); //to auto-fill update account form
			$("div.form #fullName").attr("value",fullname.value); //to auto-fill update account form
			$("div.form #oldpassword").attr("value"," ");
			$("div.form #newpassword").attr("value"," ");
			$("div.form #passwordConfirm").attr("value"," ");
			if (newemail.value != email.value){
				window.localStorage.setItem("authToken", this.response.token);
			}
		}
		else if (this.status === 400){
			$("#formErrors").css('display',"block");
			$("#formErrors").html(this.response.message);
		}
	}
}

checksumbit.addEventListener("click", CheckInput);
