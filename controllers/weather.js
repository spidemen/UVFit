var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require("jwt-simple");
var Activities = require("../models/UVFit").Activities;

var weatherApiKey = fs.readFileSync(__dirname + '/../weatherapikey').toString();

/* GET: Weather Forecast. */
router.get('/weather', function(req, res, next) {
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
    
    Activities.find({email: decodedToken.email}, function(err, activities) {
        
    });
});

module.exports = router;