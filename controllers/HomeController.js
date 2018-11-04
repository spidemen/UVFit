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


router.get("/login", (req, res)=> {
  //console.log(`user session: ${req.session} and expiration: ${req.expires}`);
    res.render("login");
})

router.get("/create", (req, res)=> {
  //console.log(`user session: ${req.session} and expiration: ${req.expires}`);
    res.render("register");
})

module.exports = router;
