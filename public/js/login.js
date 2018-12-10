function sendReqLogin() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    if(!email)
     {
     alert("Invalid email address"); 
     // return ;  
      }
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", RegisterResLogin);
    xhr.responseType = "json";
    xhr.open("POST", '/account/login');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({email:email, password:password}));
};

 function RegisterResLogin(){
 	
    console.log("status="+this.status);
    if (this.status == 201) {
        window.localStorage.setItem("authToken", this.response.token);
        // console.log("toke "+this.response.token);
        window.location = "profile";
    }
     else {
     	if(this.status==401) {
     		$("#login").css('display',"none");
     		$("#verificate").css('display',"block");
		$('#login').hide();
		 $('#verificate').show();
     	}
     	console.log(this.response.message);
        alert("Fail "+this.response.message);
    }
 };

$("#login").click(function(){
       sendReqLogin();

});

function sendReqVerifty() {
    var email = document.getElementById("email").value;
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", VeriftyRes);
    xhr.responseType = "json";
    xhr.open("POST", '/account/resend');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({email:email}));
};
function VeriftyRes(){
    
    console.log(this.status);
	if(this.status==200){
		alert("Success send your email, please verifty");
	   $("#login").css('display',"block");
       $("#verificate").css('display',"none");
		 $('#login').show()
		 $('#verificate').hide()
	}
	else{
	   alert("Fail "+this.response.message);
	}

}

$("#verificate").click(function(){
  console.log("login submit");
       sendReqVerifty();

});



