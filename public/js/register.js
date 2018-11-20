
 var checksumbit=document.getElementById("submit");
var savetable=document.getElementById("formErrors");
function  CheckInput() {

   
    var fullname=document.getElementById("fullName");
    var email=document.getElementById("email");
    var password=document.getElementById("password");
   
   
    /* 123@aJ11ljllkjljj   */
	var tableHTML = "<ul>";
  var flag=0;
	savetable.style.display="none";
    if(fullname.value.length<1)
    {
    	flag=1;
    	fullname.classList.add("error");
    	savetable.style.display="block";
    	tableHTML+="<li>Missing full name.</li>";
    }
    else
    {
    	fullname.classList.remove("error");
    }
    var re=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    if(!re.test(email.value))
     { 
       flag=1;
       email.classList.add("error");
       savetable.style.display="block";
       tableHTML+="<li>Invalid or missing email address.</li>";
     }
     else
     {
     	email.classList.remove("error");
     }
    
     var pw=password.value;
     if(pw.length<10||pw.length>20)
     {
  		flag=1;
       savetable.style.display="block";
       tableHTML+="<li>Password must be between 10 and 20 characters.</li>";
     }
   
     var relow=/[a-z]/;
     if(!pw.match(relow))
     {
   
       flag=1;  
       savetable.style.display="block";
       tableHTML+="<li>Password must contain at least one lowercase character.</li>";
     }
   
     var reup=/[A-Z]/;
     if(!pw.match(reup))
     {
        flag=1;  
       savetable.style.display="block";
       tableHTML+="<li>Password must contain at least one uppercase character.</li>";
     }
     
     var reN=/[0-9]/;
      if(!pw.match(reN))
     {
    
          flag=1;  
       savetable.style.display="block";
       tableHTML+="<li>Password must contain at least one digit.</li>";
     }
    	 if(flag==1)
   	  	{
    		password.classList.add("error");
     	}
    	  else
     	{
     		  password.classList.remove("error");
     	}
     var confirm=document.getElementById("passwordConfirm").value;
     if(confirm!=pw)
     {
     		 document.getElementById("passwordConfirm").classList.add("error");
      
       savetable.style.display="block";
       tableHTML+="<li>Password and confirmation password don't match.</li>";
     }
      else
     {
        document.getElementById("passwordConfirm").classList.remove("error");
     }

    savetable.innerHTML = tableHTML;
     if(!flag)
     {

      var email = document.getElementById("email").value;
      var fullname = document.getElementById("fullName").value;
      var password = document.getElementById("password").value;
      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", AccountRespon);
      xhr.responseType = "json";
      xhr.open("POST", '/account/create');
      xhr.setRequestHeader("Content-type", "application/json");
      console.log(email);
      xhr.send(JSON.stringify({email:email,fullname:fullname, password:password}));

     }


}

function AccountRespon()
{
      console.log("status="+this.status);
     if (this.status === 201) 
     {
        alert("Success create account");
     
        window.location = "profile";
     }
     else
     {
        //  savetable.style.display="block";
        $("#formErrors").css('display',"block");
        var tableHTML = "<p>"+this.response.message+"</p>";
        savetable.innerHTML = tableHTML;
        //$("#formErrors").html(tableHTML);
        console.log(this.response.message);
        
     }  
 
}

checksumbit.addEventListener("click", CheckInput);

