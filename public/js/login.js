

   function sendReqLogin() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
   
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", RegisterResLogin);
    xhr.responseType = "json";
    xhr.open("POST", '/account/login');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({email:email, password:password}));
   };

 function RegisterResLogin(){
 	
     console.log("status="+this.status);
     if (this.status === 201) 
     {
     	alert("Success login");
       window.localStorage.setItem("authToken", this.response.token);
      // console.log("toke "+this.response.token);
        window.location = "profile";
     }
     else
     {
     	console.log(this.response.message);
        alert("Fail "+this.response.message);
     }
 };

$("#login").click(function(){
  
       sendReqLogin();

});

