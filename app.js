
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require("passport");
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
const home = require("./controllers/HomeController.js");



//The order of these middleware matters
//flash message - flash message before validation
app.use(flash());

//DB
//mongoose.connect("mongodb://localhost/UVFit");
mongoose.connect("mongodb://localhost/UVFit");

//server setup
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
//session
app.use(session({
  secret: "wasssuppman",
  resave:true,
  saveUninitialized:true
}))

//passport stuffs
//app.use(passport.initialize());
//app.use(passport.session());

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

  res.locals.success = req.flash("success");
  //for passport
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  console.log(`This is the global user: ${req.user} and the session is ${JSON.stringify(req.session, undefined, 2)}`); //this will be important
  next();
})

//routes
app.use(home);
//Server
app.listen(process.env.PORT || 3000, process.env, function() {
  console.log("Server started..")
})
