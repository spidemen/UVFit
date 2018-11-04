var express = require('express');
var router = express.Router();
var User1 = require('../models/testResult').User1;
var education = require('../models/testResult').education;
var experience = require('../models/testResult').experience;
var progress = require('../models/testResult').progress;
var File = require('../models/testResult');

/* GET home page. */
  router.get('/index', function(req, res) {
   //  res.render("home");
	   res.render('index', { title: 'index' });
  });

  /* login */
  router.get('/login', function(req, res) {
  	 
	    res.render('login', { title: 'login' });
  });




router.get('/testGenerate', function(req, res) {
  	    // 增加记录 基于model操作
  	 
	     res.render('testGenerate', { title: 'testGenerate' });
  });

 router.post('/ucenter', function(req, res) {

           const email=req.body.email;
          // File.GetObjRecord(User,email);
           File.createpdf(res,email);
           
       
           //  res.redirect('/');
 });
  /* ucenter */
  router.post('/pdf', function(req, res) {

    

    res.render('index', { title: 'index' });
    
  });
  
  module.exports = router;