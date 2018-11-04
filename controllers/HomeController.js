const express = require("express");
const User = require("../models/visitor");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();


//Main page
router.get("/", (req, res)=> {
  //console.log(`user session: ${req.session} and expiration: ${req.expires}`);
    res.render("home");
})


module.exports = router;
