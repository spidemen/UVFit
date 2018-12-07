
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
		//to fill in form in update account
		 var email=data.email;
		$("div.form #email2").attr("value",email);
		$("div.form #fullName").attr("value",username);
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

$("#updateAccount").click(function(){
	console.log("click update account button"); 
	$(".updateAccountForm").css('display', "inline-block");
	$(".registerbox").css('display',"none");
	$(".view").css('display',"none");
	$(".error").css('display',"none");
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




