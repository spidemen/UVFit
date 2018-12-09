const express = require('express');
const router = express.Router();
var fs = require('fs');
var jwt = require("jwt-simple");
var request = require("request");
var User = require("../models/UVFit").User;

var secret = fs.readFileSync(__dirname + '/../jwtkey').toString();
var particleAccessToken = "afc3b9722a095aca53a7ea89cd2d759d3c60cd05";

/* POST: Update User defined Threshold. */
router.post('/uvThreshold', function(req, res, next) {
    
    var responseJson = { 
       status : "",
       message : ""
    };
    
    try {
        var decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }
    
    // Ensure the PUT data includes correct properties
    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing deviceId parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("uvThreshold") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing uvThreshold parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
/*  
    User.findOne({ email:req.body.email }, function(err, user) {
        if (err) {
            responseJson.status = "ERROR";
            responseJson.message = "Error Updating User Threshold";
            return res.status(201).send(JSON.stringify(responseJson));
        }
        else {
            user.uvThreshold = req.body.uvThreshold;
            user.save(function(err, user) {
                if (err) {
                    responseJson.status = "ERROR";
                    responseJson.message = "Error Updating User Threshold";
                    return res.status(201).send(JSON.stringify(responseJson));
                }
            });
        }
    });
*/
    
    request({
        method: "POST",
        uri: "https://api.particle.io/v1/devices/" + req.body.deviceId + "/updateThres",
        form: {
            access_token : particleAccessToken,
            args: "" + req.body.uvThreshold
        }
    });
    
    responseJson.success = true;
    responseJson.message = "Device ID: " + req.body.deviceId + " threshold updated.";
    return res.status(200).json(responseJson);
});

module.exports = router;