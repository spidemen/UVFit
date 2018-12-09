var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require("jwt-simple");
var request = require("request");
var Activity = require("../models/UVFit").Activities;

var secret = fs.readFileSync(__dirname + '/../jwtkey').toString();
var weatherApiKey = fs.readFileSync(__dirname + '/../weatherapikey').toString();

/* GET: Weather Forecast. */
router.get('/weather', function(req, res, next) {
    
    var responseJson = { 
       status : "",
       message : "",
       lat : "",
       lon : "",
       weather : "",
       uvFore : "",
       uvCurr : ""
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
            lon = lastAct.lons[lastAct.lons.length-1];
            
            responseJson.lat = lat;
            responseJson.lon = lon;

            /* Get Weather for lat,lon */
            request({
                method: 'GET',
                uri: "http://api.openweathermap.org/data/2.5/forecast",
                qs: {
                    appid: weatherApiKey,
                    lat: lat,
                    lon: lon
                }
            }, function(error, response, body) {
                responseJson.weather = JSON.parse(body);

                /* Get uv index for lat,lon */
                request({
                    method: 'GET',
                    uri: "http://api.openweathermap.org/data/2.5/uvi/forecast",
                    qs: {
                        appid: weatherApiKey,
                        lat: lat,
                        lon: lon,
                        cnt: 5
                    }
                }, function(error, response, body) {
                    responseJson.uvFore = JSON.parse(body);
                    
                    /* Get uv index for lat,lon */
                    request({
                        method: 'GET',
                        uri: "http://api.openweathermap.org/data/2.5/uvi",
                        qs: {
                            appid: weatherApiKey,
                            lat: lat,
                            lon: lon
                        }
                    }, function(error, response, body) {
                        responseJson.uvCurr = JSON.parse(body);
                        
                        return res.status(200).json(responseJson);
                    });
                });
            });
        }
        else {
            responseJson.message = "No location data for user"
            return res.status(201).json(responseJson);
        }
    });
});

module.exports = router;