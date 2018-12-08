const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const home = require("./controllers/HomeController.js");
const photonRouter = require('./controllers/photon.js');
const uvRouter = require('./controllers/uvThreshold.js');
const weatherRouter = require('./controllers/weather.js');

//DB
//mongoose.connect("mongodb://localhost/UVFit");
mongoose.connect("mongodb://localhost/UVFit");

//server setup
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
        root      = namespace.shift(),
        formParam = root;
    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg   : msg,
        value : value
    };
  }
}));


//global variable setup in html
app.use(function(req, res, next){
    next();
})

//routes
app.use(home);
app.use(photonRouter);
app.use(uvRouter);
app.use(weatherRouter);
//Server
app.listen(process.env.PORT || 3000, process.env, function() {
  console.log("Server started..")
})
