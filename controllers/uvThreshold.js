const express = require('express');
const router = express.Router();
var User = require("../models/UVFit").User;

/* PUT: Update User defined Threshold. */
router.put('/uvThreshold', function(req, res, next) {
    
    var responseJson = { 
       status : "",
       message : ""
    };
    
    // Ensure the PUT data includes correct properties
    if( !req.body.hasOwnProperty("email") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing  parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("uvThreshold") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing  parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
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
                else {
                    responseJson.status = "OK";
                    responseJson.message = "User Threshold Updated";
                    return res.status(200).send(JSON.stringify(responseJson));
                }
            });
        }
    });
});

module.exports = router;