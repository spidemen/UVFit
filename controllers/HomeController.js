const express = require("express");
var Device = require("../models/UVFit").Device;
var Activities = require("../models/UVFit").Activities;
var User = require("../models/UVFit").User;
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");
var nodemailer = require('nodemailer');
var crypto = require('crypto');
const router = express.Router();

var secret ="klaglhjji34;wl5j35";
var secret1 ="klaglsfsfhjji34;wl5j35";
//Main page
router.get("/", (req, res)=> {
    res.render("home");
})
router.get("/create", (req, res)=> { 
    res.render("register");
})
router.get("/profile", (req, res)=> {
  
    res.render("profile");
})
router.get("/login", (req, res)=> {
  
    res.render("login");
})

router.post("/account/create", (req, res)=> {
      
    console.log(req.body.email+"   "+req.body.fullname+"  "+req.body.password);

  bcrypt.hash(req.body.password, null, null, function(err, hash) {
       User.findOne({email:req.body.email},function(err,user){
              if(err){     
                  res.status(400).json({create:false,message:err+" db error"});
               }
             else {
                if(user==null){
                   var newuser=new User({
                  email: req.body.email,
                  fullName:  req.body.fullname,
                  passwordHash: hash
                  });
                  newuser.save( function(err, user) {
                  if (err) {
            //  console.error(err);
                    console.log("Fail store create user  db error");   
                    res.status(400).json({create:false,message:err+" db error"});  
               
                  }
                 else  {
                   console.log("success create a user");
                   res.status(201).json({create:true,message:"Success create a user"});   
                  }
                }); 
               }
             else{
                        //  // Send the email
                  var token = crypto.randomBytes(16).toString('hex');
                 var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'hamiltonbill2018@gmail.com', pass: 'hamilton2018' } });
                 var mailOptions = { from: 'hamiltonbill2018@gmail.com', to: req.body.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + "/confirmation?id=" +token};
                transporter.sendMail(mailOptions, function (err) {
                if (err) {    console.log(err);  return res.status(400).json({create:false,message:"Error: send user email"});; }
                  res.status(200).json({create:false,message:'A verification email has been sent to ' + user.email + '.'});
                });    

                 // res.status(400).json({create:false,message:"User  already exit, please choose another email"});
            }

        } 
       //  // Send the email
       // var token = jwt.encode({email: req.body.email}, secret1);
       // var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
       // var mailOptions = { from: 'no-reply@UVFit.com', to: req.body.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + "/confirmation?id=" + token.token};
       // transporter.sendMail(mailOptions, function (err) {
       // if (err) { return res.status(400).json({create:false,message:"Error: send user email"});; }
       //    res.status(200).json({create:false,message:'A verification email has been sent to ' + user.email + '.'});
       //   });    

    });
  });

  

});

router.post("/confirmation", (req, res)=> {

        console.log("user click verification link");
});
router.post("/account/login", (req, res)=> {
    
  //  console.log(req.body.email+"   "+req.body.password);
    User.findOne({email:req.body.email},function(err,user)
      {
          if(err)
          {   
            res.status(400).json({create:false,message:err+" db error"});
          }
          else
          {

              if(user!=null)
              {
                console.log("user email: "+user.email);
              bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
                if(err){
                    res.status(400).json({create:false,message:"Error authenticating. Please contact support."}); 
                }
               else{
                  if(valid){
                    var token = jwt.encode({email: req.body.email}, secret);
                    console.log("Success find user");
                    res.status(201).json({create:true,message:"sucess find",token:token});
                  }
                  else {
                    console.log(req.body.password+" hash "+user.passwordHash);
                    res.status(400).json({create:false,message:"The email or password provided was invalid."});
                  }
               }
             });
            }
          else{
              res.status(400).json({create:false,message:"No any record find, please do create."});
          }
        }

      });
   // res.status(201).json({message:"testing"});
   // res.render("login");
})



router.get("/test", (req, res,next)=> {

    /*store testing data  */
    console.log("store testing data");
    var newActivities= new Activities({
     activityType: "walk",
     lats:      115,
     lons:       167,
     speeds:       3,
     uvIndices:    2,
     duration:     3600,
     calories:     1200, 
     uvExposure:    500,
     deviceId:      "11f4baaef3445ff"
    });
    newActivities.save( function(err, activities) {
           if (err) {
            //  console.error(err);
               console.log("Fail store activities data");
           
               
           }
           else {
              console.log("success store activities data");
            
           }
      });

    var newuser=new User({

     email:  "demo@email.com",
     fullName:    "demo",
     passwordHash: "123",
     userDevices:  "11f4baaef3445ff",
      uvThreshold:  12
    });
   newuser.save( function(err, user) {
           if (err) {
            //  console.error(err);
               console.log("Fail store user data");      
               
           }
           else {
              console.log("success store user data");
            
           }
      });
    

});
// register device
router.post("/devices/register", (req, res,next)=> {


  
   // check device ID already register
    Device.findOne({deviceId:req.body.deviceId}, function(err, device) {
        if(!err)
        {
            if(device!=null)
            {
             console.log("Already registered ");
             res.status(201).json( {registered: false, message: "Device ID="+req.body.deviceId+" already registered"});
            }
            else
            {
              console.log("Register a new device"+req.body.deviceId);
               var NewDevice = new Device({
               userEmail: req.body.email,
               deviceId:req.body.deviceId,
                deviceName: req.body.deviceName
                }); 
                 NewDevice.save( function(err, device) {
                  if (err) {
                  //  console.error(err);
                  console.log("Fail store");
                   res.status(400).json( {registered: false, message: err+" db error fail create"});
               
                 }
                 else {
                         console.log("success store");

                         User.update({email:req.body.email},{$push:{userDevices:req.body.deviceId}},function(err,user){
                             if(err)
                              console.log(err);
                            else
                            {
                              console.log("success update user ");
                               res.status(201).json( {registered: true, message: "Device ID:"+req.body.deviceId + " was registered."}) 
                            }
                         });
               }
               });
          }
        }
        else
        {       
            res.status(400).json( {registered: false, message: err+" db error "});
         
         }
      });


})

// view data
router.post("/activities/user", (req, res,next)=> {
   
  /*  var responseJson = { found:false,
                        activities:[
                        {type: "",
                         date:""
                       }
                        ],
                       message:""};
      */
              
     var responseJson = { found:false,
                        activities:[  ],
                       message:""};

    
    console.log(req.body.email+"   "+req.body.deviceId);
    var Email=req.body.email;
    User.findOne({email:Email}, function(err,user){
        if(err)
        {
            res.status(400).json( {found: false, message: err+"  db error find user"});
        }
       else
       {

        if(user!=null)
        {
         console.log(user.userDevices);
         Activities.find({deviceId:user.userDevices[0]},function(err,activities)
          {
            if(err)
            {
                res.status(400).json( {found: false, message: err+" can not find any activities record"});
            }
            else
            {
                responseJson.found=true;
                responseJson.message="Activities found.";
               
                for(var act of  activities)
                {
                  responseJson.activities.push({ 
                      "type": act.activityType,
                      "date":act.timePublished,
                      "duration": act.duration,
                      "calories":  act.calories, 
                      "uvExposure":  act.uvExposure
                  });
                }
               //  console.log(responseJson);
                res.status(201).json(responseJson);
            }
          });

        }
        else
        {
           res.status(400).json( {found: false, message: err+"  user email do not exit, please create account first"});
        }

      }

    });
   // res.render("profile");
})

module.exports = router;
