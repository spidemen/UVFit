$(window).on("load", function () {

  $.ajax({
   url:'profile',
   type:'GET',
   success: function(data){
   	let searchParams = new URLSearchParams(window.location.search)
   	 let date = searchParams.get('id');
   	  let id = searchParams.get('deviceid');
       var xhr = new XMLHttpRequest();
       xhr.addEventListener("load", SingleViewRespon);
       xhr.responseType = "json";
       xhr.open("POST", '/devices/singleview');
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify({date:date,deviceId:id}));
        console.log("get date from page profile date="+date+"  id="+id);
      }
   });
});

function SingleViewRespon(){

       $("#formErrors").css('display',"block");
       $("#formErrors").html(date+id);
}