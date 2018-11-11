var express = require('express');
var router = express.Router();
var Device = require("../models/UVFit").Device;
var Activity = require("../models/UVFit").Activities;

/* POST: Register new device. */
router.post('/activities/datapoint', function(req, res, next) {
    
    console.log("Storing Published Data");

    var responseJson = { 
       status : "",
       message : ""
    };

    // Ensure the POST data includes correct properties
    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing deviceId parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("longitude") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing longitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("latitude") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing latitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing speed parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("uvIntensity") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing uvIntensity parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    // Find the device and verify the apikey
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device !== null) {
           if (device.apikey != req.body.apikey) {
               responseJson.status = "ERROR";
               responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
               return res.status(201).send(JSON.stringify(responseJson));
           }
           else {
               // Create a new activity with device data and device ID
               var newActivity = new Activity({
                  lats: req.body.latitude,
                  lons: req.body.longitude,
                  speeds: req.body.speed,
                  uvIndices: req.body.uvIntensity,
                  deviceId: req.body.deviceId
               });

               // Save device. If successful, return success. If not, return error message.                                                        
               newActivity.save(function(err, newActivity) {
                 if (err) {
                   responseJson.status = "ERROR";
                   responseJson.message = "Error saving data in db.";
                   return res.status(201).send(JSON.stringify(responseJson));
                 }
                 else {
                   responseJson.status = "OK";
                   responseJson.message = "Data saved in db with object ID " + newActivity._id + ".";
                   return res.status(201).send(JSON.stringify(responseJson));
                 }
               });
           }
        } 
        else {
           responseJson.status = "ERROR";
           responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
           return res.status(201).send(JSON.stringify(responseJson));        
        }
    });
});

module.exports = router;