var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require("jwt-simple");
var Activity = require("../models/UVFit").Activities;

var secret = fs.readFileSync(__dirname + '/../jwtkey').toString();
var weatherApiKey = fs.readFileSync(__dirname + '/../weatherapikey').toString();

/* GET: Weather Forecast. */
router.get('/weather', function(req, res, next) {
    
    var responseJson = { 
       status : "",
       message : "",
       lat : "",
       lon : ""
    };
    
    try {
        var decodedToken = jwt.decode(req.headers["x-auth"], secret);
    }
    catch (ex) {
        responseJson.message = "Invalid authorization token.";
        return res.status(400).json(responseJson);
    }
    
    var lat;
    var lon;
    /* Get User's last lat/lon */
    Activity.find({deviceId: req.query.deviceId}, function(err, activities) {
        if(err) {
            responseJson.message = err;
            return res.status(400).json(responseJson);
        }
        if (activities.length > 0) {
            now = Date.now();
            var lastAct = activities[0];
            for (act of activities) {
                if ((now - act.timestamps[act.timestamps.length-1].getTime()) < (now - lastAct.timestamps[lastAct.timestamps.length-1].getTime())){
                    lastAct = act;
                }
            }
            lat = lastAct.lats[lastAct.lats.length-1];
            lon = lastAct.lats[lastAct.lons.length-1];
            
            responseJson.lat = lat;
            responseJson.lon = lon;
            return res.status(200).json(responseJson);
        }
        else {
            responseJson.message = "No location data for user"
            return res.status(201).json(responseJson);
        }
    });
});

module.exports = router;