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
    if(fullname.value.length<1) {
    	flag=1;
    	fullname.classList.add("border");
        fullname.classList.add("border-danger");
    	savetable.style.display="block";
    	tableHTML+="<li>Missing full name.</li>";
    }
    else {
    	fullname.classList.remove("border");
        fullname.classList.remove("border-danger");
    }
    var re=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    if(!re.test(email.value)) { 
       flag=1;
       email.classList.add("border");
       email.classList.add("border-danger");
       savetable.style.display="block";
       tableHTML+="<li>Invalid or missing email address.</li>";
    }
    else {
        email.classList.remove("border");
        email.classList.remove("border-danger");
    }
    
    var pw=password.value;
    if(pw.length<10||pw.length>20) {
        flag=1;
        password.classList.add("border");
        password.classList.add("border-danger");
        savetable.style.display="block";
        tableHTML+="<li>Password must be between 10 and 20 characters.</li>";
    }
    else {
        password.classList.remove("border");
        password.classList.remove("border-danger");
    }
   
    var relow=/[a-z]/;
    if(!pw.match(relow)) {
        flag=1;
        password.classList.add("border");
        password.classList.add("border-danger");
        savetable.style.display="block";
        tableHTML+="<li>Password must contain at least one lowercase character.</li>";
    }
    else {
        password.classList.remove("border");
        password.classList.remove("border-danger");
    }
   
    var reup=/[A-Z]/;
    if(!pw.match(reup)) {
        flag=1;
        password.classList.add("border");
        password.classList.add("border-danger");
        savetable.style.display="block";
        tableHTML+="<li>Password must contain at least one uppercase character.</li>";
    }
    else {
        password.classList.remove("border");
        password.classList.remove("border-danger");
    }
    
    var reN=/[0-9]/;
    if(!pw.match(reN)) {
        flag=1;
        password.classList.add("border");
        password.classList.add("border-danger");
        savetable.style.display="block";
        tableHTML+="<li>Password must contain at least one digit.</li>";
    }
    else {
        password.classList.remove("border");
        password.classList.remove("border-danger");
    }
    
    var confirm=document.getElementById("passwordConfirm");
    if(confirm.value!=pw) {
        flag=1;
        confirm.classList.add("border");
        confirm.classList.add("border-danger");
        savetable.style.display="block";
        tableHTML+="<li>Password and confirmation password don't match.</li>";
    }
    else {
        confirm.classList.remove("border");
        confirm.classList.remove("border-danger");
    }
    savetable.innerHTML = tableHTML;
    if(!flag) {
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

function AccountRespon() {
    console.log("status="+this.status);
    if (this.status === 201) {
        alert("Account successfully registered. Please verify your email address within 1 hour!");
        window.location = "login";
    }
    else {
        //  savetable.style.display="block";
        $("#formErrors").css('display',"block");
        var tableHTML = "<p>"+this.response.message+"</p>";
        savetable.innerHTML = tableHTML;
        //$("#formErrors").html(tableHTML);
        console.log(this.response.message);
    }  
}

checksumbit.addEventListener("click", CheckInput);

