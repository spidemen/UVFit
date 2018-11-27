var express = require('express');
var router = express.Router();
var Device = require("../models/UVFit").Device;
var Activity = require("../models/UVFit").Activities;

/* POST: Activity Datapoints. */
router.post('/activities/datapoints', function(req, res, next) {
    
    console.log("Publish Request Received with Data:");
    console.log(req.body);

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
    
    if( !req.body.hasOwnProperty("longitudes") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing longitudes parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("latitudes") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing latitudes parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("speeds") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing speeds parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("uvIntensities") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing uvIntensities parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("timestamps") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing timestamps parameter.";
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
                console.log("Device Found: " + req.body.deviceId + ", apikey matches");
                
                var longitudes = req.body.longitudes.split(",");
                var latitudes = req.body.latitudes.split(",");
                var speeds = req.body.speeds.split(",");
                var uvIntensities = req.body.uvIntensities.split(",");
                var timestamps = req.body.timestamps.split(",");
                
                if (timestamps == "begin") {
                    //Create Activity
                    console.log("Creating Activity");
                    // Create a new activity with device data and device ID
                    var newActivity = new Activity({
                      publishing: true,
                      deviceId:  req.body.deviceId
                    });
                    newActivity.save(function(err, newActivity) {
                        if (err) {
                            responseJson.status = "ERROR";
                            responseJson.message = "Error Creating Activity";
                            return res.status(201).send(JSON.stringify(responseJson));
                        }
                        else {
                            console.log("Activity Created: " + newActivity._id)
                            responseJson.status = "OK";
                            responseJson.message = "Activity Created with ID: " + newActivity._id;
                            return res.status(201).send(JSON.stringify(responseJson));
                        }
                    });
                }
                else if (timestamps == "end") {
                    //Complete Activity
                    Activity.findOne({
                        $and: [
                            { deviceId: req.body.deviceId },
                            { publishing: true }
                        ]
                    }, function(err, activity) {
                        if (err) {
                            console.log("Error Finding Activity to Complete!");
                            responseJson.status = "ERROR";
                            responseJson.message = "Error Finding Activity to Complete!";
                            return res.status(201).send(JSON.stringify(responseJson));
                        }
                        else {
                            console.log("Post Processing Activity: " + activity._id);
                            
                            activity.publishing = false;
                            activity.duration = (activity.timestamps[activity.timestamps.length-1] - activity.timestamps[0])/1000 + 1;
                            
                            activity.save(function(err, activity) {
                                if(err) {
                                    responseJson.status = "ERROR";
                                    responseJson.message = "Error Completing Activity: " + activity._id;
                                    return res.status(201).send(JSON.stringify(responseJson));
                                }
                                else {
                                    responseJson.status = "OK";
                                    responseJson.message = "Completed Activity with ID: " + activity._id;
                                    return res.status(201).send(JSON.stringify(responseJson));
                                }
                            });
                        }
                    });
                }
                else {
                    //Update Activity
                    var dates = [];
                    for (t in timestamps) {
                        dates.push(new Date(timestamps[t]*1000));
                    }
                    
                    Activity.findOneAndUpdate(
                        {
                            $and: [
                                { deviceId: req.body.deviceId },
                                { publishing: true }
                            ]
                        }, 
                        {
                            $push: {
                                lats: { $each: latitudes } ,
                                lons: { $each: longitudes },
                                speeds : { $each: speeds },
                                uvIndices : { $each: uvIntensities },
                                timestamps : { $each: dates }
                            }
                        }, function(err, activity) {
                            if (err) {
                                console.log("Error Finding Activity to Update!");
                                responseJson.status = "ERROR";
                                responseJson.message = "Error Updating Activity";
                                return res.status(201).send(JSON.stringify(responseJson));
                            }
                            else {
                                console.log("Activity Updated: " + activity._id);
                                responseJson.status = "OK";
                                responseJson.message = "Activity Updated";
                                return res.status(201).send(JSON.stringify(responseJson));
                            }
                        }
                    );
                }
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