
      
      google.maps.visualRefresh=true;
      var map;
      var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var labelIndex = 0;
      var geocoder;
    
      
      var address='85719';
     
      function initialize() {
   
          map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10
          });

         var location=getLatLngByZipcode(address);
     
      }
      function isEmptyObject(e) {  
        var t;  
         for (t in e)  
          return false;  
       return true;
     }  
    
      function addMarker(location, map) {
     
        var marker = new google.maps.Marker({
          position: location,
          label: labels[labelIndex++ % labels.length],
          map: map
        });
      }
      function getLatLngByZipcode(zipcode) {
        geocoder = new google.maps.Geocoder();
        var address = zipcode;
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                map.setCenter(results[0].geometry.location);
                new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
               });
          
               document.getElementById("Address").innerHTML =results[0].formatted_address;
            } else {
                alert("Request failed.")
            }
        });
        return [latitude, longitude];
      }
      google.maps.event.addDomListener(window, 'load', initialize);      
     