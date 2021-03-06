
$("#logout").click(function(){
        console.log("remove iterm storage");
        window.localStorage.removeItem("authToken");
  });

var date,deviceId;
$(window).on("load", function () {
  $.ajax({
   url:'profile',
   type:'GET',
   success: function(data){
   	let searchParams = new URLSearchParams(window.location.search)
   	  date = searchParams.get('id');
   	   deviceId = searchParams.get('deviceid');
       var xhr = new XMLHttpRequest();
       xhr.addEventListener("load", SingleViewRespon);
       xhr.responseType = "json";
       xhr.open("POST", '/activities/single');
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify({date:date,deviceId:deviceId}));
        console.log("get date from page profile date="+date+"  id="+deviceId);
     
      }
   });
});

function SingleViewRespon(){

		   var responseHTML="";
           responseHTML+="<tr>"+$("tr:first").html()+"</tr>";
           responseHTML+="<tr> ";
          responseHTML+="<td>"+this.response.activities.type+"</td>";
          responseHTML+="<td>  "+this.response.activities.date+" </td>";
          responseHTML+="<td>"+this.response.activities.duration+"</td>";
          responseHTML+="<td>"+this.response.activities.calories+"</td>";
          responseHTML+="<td>"+this.response.activities.uvExposure+"</td>";
           responseHTML+="</tr>"; 

        $("table").html(responseHTML)
	
		// var data = [this.response.activities.uvs,this.response.activities.speeds];
		var track1={
  			// x: this.response.activities.uvs,
  		    x: this.response.activities.times,
  			y: this.response.activities.speeds,
  			mode: 'lines',
 			type: 'scatter',
 			name: 'speeds'
		};
	   var layout = {
       title: 'speed graph',
    	  xaxis: {
        'title': 'time'
 	   },
 	   yaxis: {
        'title': 'speed (km/s)'
 	    }
	  };
	  var data=[track1];
	  Plotly.newPlot('speeds', data,layout);

	  var track2={
  			// x: this.response.activities.uvs,
  			x: this.response.activities.times,
  			y: this.response.activities.uvs,
  			mode: 'lines',
 			type: 'scatter',
 			name: 'uv'
		};
	   var layout2= {
       title: 'UV graph',
    	  xaxis: {
        'title': 'time'
 	   },
 	   yaxis: {
        'title': 'UV (km/s)'
 	    }
	  };
	  var data2=[track2];
	  Plotly.newPlot('uvs', data2,layout2);

     // test data  
     // var lats=[ 32.242995,  32.242550,32.240501];
     // var lons=[ -110.959071,-110.958063,-110.953782];

     var lats=this.response.activities.lats;
     var lons=this.response.activities.lons;
	 initialize(lats,lons);

	// console.log(this.response.activities.uvs+"    speeds"+this.response.activities.speeds);
      
}

/*  ------------------------google map------------------------------------------------*/
var map;
var geocoder;
var delayFactor=0;
function initialize(lats,lons) {
  var map = new google.maps.Map(
    document.getElementById("map"), {
      center: new google.maps.LatLng( 32.225325 , -110.948975),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
   var lat_lng =[];
   for (var i=0;i<lats.length;i++) {
   	    var temp=new google.maps.LatLng(lats[i], lons[i]);
   	    lat_lng.push(temp);
   	   console.log("latitude ="+lats[i]+"  longtitude "+lons[i]); 
   	}
   	   var gap=1;
   	  if(lat_lng.length>50)
   	  gap=lat_lng.length/50;
	  gap=Math.round(gap);
	  console.log("gap="+gap);
  	 for (var t = 0;(t + 1) < lat_lng.length; t+=gap) {
           //  var delayFactor=0;
   	   console.log("map t="+t+"  latitude ="+lats[t]+"  longtitude "+lons[t]+" length"+lat_lng.length+"   latlen"+lats.length);
	   	 	//Intialize the Direction Service
	  //  var service = new google.maps.DirectionsService();
	  //  var directionsDisplay = new google.maps.DirectionsRenderer();
	   //  var bounds = new google.maps.LatLngBounds();
	     // var bounds = new google.maps.LatLngBounds();
		    if ((t + 1) < lat_lng.length) {
		    	var des;
		      var src = lat_lng[t];
		      if(t+gap+1>lat_lng.length)
		      	des=lat_lng[lat_lng.length-1];
		      else
		         des = lat_lng[t + 1];
		     sendRequest(src,des,map);
		     //  service.route({
		     //    origin: src,
		     //    destination: des,
		     //    travelMode: google.maps.DirectionsTravelMode.DRIVING
		     //  }, function(result, status) {
		     //    if (status == google.maps.DirectionsStatus.OK) {
		     //      // new path for the next result
		     //      var path = new google.maps.MVCArray();
		     //      //Set the Path Stroke Color
		     //      // new polyline for the next result
		     //      var poly = new google.maps.Polyline({
		     //        map: map,
		     //        strokeColor: '#4986E7'
		     //      });
		     //   	   poly.setPath(path);
				   //  for (var k = 0, len = result.routes[0].overview_path.length; k < len; k++) {
		     //        path.push(result.routes[0].overview_path[k]);
		     //        bounds.extend(result.routes[0].overview_path[k]);
		     //        map.fitBounds(bounds);
		     //      }
       //  } else
       //   alert("Directions Service failed:" + status);
       // });
   	 }
   }
      

   	     sendRequest(lat_lng[0],lat_lng[lat_lng.length-1],map);

};

google.maps.event.addDomListener(window, "load", initialize);

function sendRequest(src,des,map){
 	       var service = new google.maps.DirectionsService();
              var directionsDisplay = new google.maps.DirectionsRenderer();
              var bounds = new google.maps.LatLngBounds();

  		service.route({
		        origin: src,
		        destination: des,
		        travelMode: google.maps.DirectionsTravelMode.DRIVING
		      }, function(result, status) {
		        if (status == google.maps.DirectionsStatus.OK) {
		          // new path for the next result
		          var path = new google.maps.MVCArray();
		          //Set the Path Stroke Color
		          // new polyline for the next result
		          var poly = new google.maps.Polyline({
		            map: map,
		            strokeColor: '#4986E7'
		          });
		       	   poly.setPath(path);
				    for (var k = 0, len = result.routes[0].overview_path.length; k < len; k++) {
		            path.push(result.routes[0].overview_path[k]);
		            bounds.extend(result.routes[0].overview_path[k]);
		            map.fitBounds(bounds);
        			}
	            }
                  else if (status === google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
           	 delayFactor++;
           	 setTimeout(function () {
               sendRequest(src,des,map);
            	}, delayFactor * 1000);
        }
        else
           { 
           	// alert("Directions Service failed:" + status);
           	console.log("Directions Service failed:" + status);
            }
       });
}


$("#submit").click(function(){

    sendReqtypeChange();
});
function sendReqtypeChange(){
  var typeSelect=document.getElementById("typeSelect");
  var type=typeSelect.options[typeSelect.selectedIndex].value;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", ViewtypeChangeRespon);
  xhr.responseType = "json";
  xhr.open("POST", '/activities/change');
  xhr.setRequestHeader("Content-type", "application/json");
  console.log("send summary view"+deviceId+"  type= "+type);
  xhr.send(JSON.stringify({date:date,deviceId:deviceId,type:type}));    
}
function ViewtypeChangeRespon(){

     if(this.status === 200||this.status==201)
    {
  		alert("Success Change type."+this.response.message);
  		 var typeSelect=document.getElementById("typeSelect");
         var type=typeSelect.options[typeSelect.selectedIndex].value;
  		 $("tr:nth-child(2) td:first-child").html(type);
    }
    else
    {
         alert("Fail "+this.response.message);
    }

}



