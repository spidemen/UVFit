var express = require('express');
var router = express.Router();
var Device = require("../models/UVFit").Device;
var Activity = require("../models/UVFit").Activities;

/* POST: Register new device. */
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
                console.log("Device Found, apikey matches");
                // Find the device and verify the apikey
                Activity.findOne( {$and: [{ deviceId: req.body.deviceId }, { timestamps: { $in: req.body.timestamps[0]-1 } }]}, function(err, activity) {
                    console.log(activity);
                    if (activity === null) {
                        // Create a new activity with device data and device ID
                        var dates;
                        for (t in req.body.timestamps) {
                            dates += new Date(t*1000);
                        }
                        var newActivity = new Activity({
                          lats:       req.body.latitudes,
                          lons:       req.body.longitudes,
                          speeds:     req.body.speeds,
                          uvIndices:  req.body.uvIntensities,
                          timestamps: dates,
                          deviceId:  req.body.deviceId
                        });
                        //console.log(newActivity);
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
                    else {
                        Activity.update( activity._id,
                            { $push: {
                                    lats: { $each: req.body.latitudes } ,
                                    lons: { $each: req.body.longitudes },
                                    speeds : { $each: req.body.speeds },
                                    uvIndices : { $each: req.body.uvIntensities },
                                    timestamps : { $each: req.body.timestamps }
                                }
                            }
                        );
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