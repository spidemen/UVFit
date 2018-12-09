const express = require("express");
const url = require('url');
var Device = require("../models/UVFit").Device;
var Activities = require("../models/UVFit").Activities;
var User = require("../models/UVFit").User;
var token=require("../models/UVFit").token;
var bcrypt = require("bcrypt-nodejs");
var jwt = require("jwt-simple");
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var fs = require('fs');
const router = express.Router();
var mongoose = require('mongoose');
var async=require('async');
mongoose.Promise = global.Promise;

var secret = fs.readFileSync(__dirname + '/../jwtkey').toString(); //this is now saved in a file
var secret1 ="klaglsfsfhjji34;wl5j35"; //this is to remain unused
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
});
router.get("/singleview", (req, res)=> {
  
    res.render("singleview");
});

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 32; i++) {
       newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return newApikey;
}

function authenticateAuthToken(req) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return null;
    }
   
    var authToken = req.headers["x-auth"];
   
    try {
        var decodedToken = jwt.decode(authToken, secret);
        return decodedToken;
    }
    catch (ex) {
        return null;
    }
}


function delay(result){
   return new Promise(resolve=>setTimeout(()=>{
       resolve(result);
   },300));
}
async function delayedLog1(item,responseJson,result){
    await delay(result);
    responseJson.user.push(result);
    console.log(item+" push json"+result);
}
async function delayedLog(item){
    await delay(item);
    console.log(item);
   
}
async function processArray(array,userName,responseJson){
        array.forEach(async (item)=>{
           console.log("user for loop"+userName+"  deviceId"+item+"   j=");
            let result;
           if(item!=null) {
                       
            result=findAllUser(item,userName);
            // await delay();  
            // await delay();         
            // responseJson.user.push(result);
            console.log("item is not null");
             await delayedLog1(item,responseJson,result);
            }
          await delayedLog(item);
        });
}
async function   findAllUser(deviceId,userName){
   // return new Promise((resolve, reject) => {
   //  findAllUser(deviceId,userName,(result)=>{

               var result;
               var summaryActivities =  Activities.find({
                    "deviceId":deviceId,
                     "timePublished": 
                   {
                      $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                  }
                  }).sort({ "date": -1 });

                 summaryActivities.exec({}, function(err, activities) {
                    if (err) {
                      responseJson.success = false;
                      responseJson.message = "Error accessing db.";
                      console.log("cannot find any data  avg view");
                      res.status(400).send(JSON.stringify(responseJson));
                     }
                   else{
                      var totalduration=0;
                      var totalcalories=0;
                      var totaluv=0;
                      var  count=0;
                      for( var oneActivity of activities){
                          totalduration+=oneActivity.duration;
                          totalcalories+=oneActivity.calories;
                          totaluv+=oneActivity.uvExposure;
                          count++;
                      }

                      result={ 
                              "userName": userName,
                              "deviceId": deviceId,
                              "totalduration": totalduration/count,
                              "totalcalories":  totalcalories/count, 
                              "totaluv":  totaluv/count,
                              "totalactivities": count
                          };
                      // console.log("iteration i="+i);
                      // console.log(responseJson);
                      // responseJson['totalduration']=totalduration/count;
                      // responseJson['totalcalories']=totalcalories/count;
                      // responseJson['totaluv']=totaluv/count;

                      // resolve(responseJson);
                       // resolve(result);
                       console.log(result);
                     
                 }
              });

        return  result;
  //      })
  // });
};




router.get("/account/user", (req, res)=> {

   
      // Check for authentication token in x-auth header
  if (!req.headers["x-auth"]) {
      return res.status(401).json({success: false, message: "No authentication token"});
   }
   
   var authToken = req.headers["x-auth"];
   try {
      var decodedToken = jwt.decode(authToken, secret);
      var userStatus = {};
       console.log("enter ajax accout get user infor "+decodedToken.email);
       User.findOne({email: decodedToken.email}, function(err, user) {
		   
         if(err) {
            return res.status(200).json({success: false, message: "User does not exist."});
         }
         else {
            userStatus['success'] = true;
            userStatus['email'] = user.email;
            userStatus['fullName'] = user.fullName;
            userStatus['lastAccess'] = user.lastAccess;
            
            // Find devices based on decoded token
          Device.find({ userEmail : decodedToken.email}, function(err, devices) {
            if (!err) {
               // Construct device list
               var deviceList = []; 
               for (device of devices) {
                 deviceList.push({ 
                       deviceId: device.deviceId,
                       apikey: device.apikey,
                 });
                 console.log(device.deviceId);
               }
               userStatus['devices'] = deviceList;
            }
            
               return res.status(200).json(userStatus);            
          });
         }
      });
   }
   catch (ex) {
      return res.status(401).json({success: false, message: "Invalid authentication token."});
   }
});


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
                  
                  var tokeninput = crypto.randomBytes(64).toString('hex');
                 // create a newtoken
                  var newtoken=new token({
                     _userId: user._id,
                     token: tokeninput
                  });
                  newtoken.save(function(err){
                      if(err){
                        res.status(400).json({create:false,message:err+" db error"});  
                      }
                       //   Send the email
                      var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'uvfit2018@gmail.com', pass: 'UVFit2018@AZ&' } });
                      var mailOptions = { from: 'uvfit2018@gmail.com', to: req.body.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + "/confirmation?id=" +tokeninput};
                      transporter.sendMail(mailOptions, function (err) {
                      if (err) {    console.log(err);  return res.status(400).json({create:false,message:"Error: send user email"});; }
                      res.status(200).json({create:false,message:'Success create a user , A verification email has been sent to ' + user.email + '. please do email verification within one hours'});
                      });    
                      //   res.status(201).json({create:true,message:"Success create a user"});   
                  }); 

                 }
                }); 
               }
             else{
                      
                  res.status(400).json({create:false,message:"User  already exit, please choose another email"});
            }

        } 

    });
  });

  

});

router.get("/confirmation", (req, res)=> {

     
        console.log(req.param('id'));
      token.findOne({token:req.param('id')},function(err,token)
      {
         
              if(token!=null)
              {
                console.log("user  id : "+token._userId);
                User.findOne({ _id: token._userId }, function (err, user) {
                if (!user) return res.status(400).json({ msg: 'We were unable to find a user for this token.' });
                if (user.isVerified) return res.status(400).json({ type: 'already-verified', msg: 'This user has already been verified.' });
 
                 // Verify and save the user
                user.isVerified = true;
                user.save(function (err) {
                   if (err) { return res.status(500).send({ msg: err.message }); }
                   res.redirect('login');
                  // res.status(200).json({msg:"The account has been verified. Please log in."});
                 });
              });
            }
          else{
              res.status(500).json({type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.'});       
          }

      });

});

router.post("/account/resend", (req, res)=> {

     console.log("user email  verifty: "+req.body.email);
     User.findOne({email:req.body.email},function(err,user)
      {
          if(err)
          {   
            res.status(400).json({type:false,message:err+" db error"});
          }
          else
          {

              if(user!=null)
              {
                console.log("user email  verifty: "+user.email);
               if (user.isVerified) return res.status(400).send({ message: 'This account has already been verified. Please log in.' });
                 var tokeninput = crypto.randomBytes(64).toString('hex');
                 // create a newtoken
                  var newtoken=new token({
                     _userId: user._id,
                     token: tokeninput
                  });
                  newtoken.save(function(err){
                      if(err){
                        res.status(400).json({type:false,message:err+" db error"});  
                      }
                      else{
                            //   Send the email
                         var transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: 'uvfit2018@gmail.com', pass: 'UVFit2018@AZ&' } });
                         var mailOptions = { from: 'uvfit2018@gmail.com', to: req.body.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + "/confirmation?id=" +tokeninput};
                         transporter.sendMail(mailOptions, function (err) {
                         if (err) {    console.log(err);  return res.status(400).json({create:false,message:"Error: send user email"});; }
                            res.status(200).json({create:false,message:'Success create a user , A verification email has been sent to ' + user.email + '. please do email verification within one hours'});
                          });    
                      }
                 });
               
            }
          else{
              res.status(400).json({type:false,message:"We were unable to find a user with that email"});
          }
        }

      });

});


router.post("/account/login", (req, res)=> {
    
  console.log(req.body.email+"   "+req.body.password);
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
					 
                    res.status(400).json({create:false,message:"Error authenticating. Please contact support.mmmmmm"}); 
                }
               else{
                  if(valid){

                    if(!user.isVerified)  res.status(401).send({ type: 'not-verified', message: 'Your account has not been verified.' }); 
                    else{
                    var token = jwt.encode({email: req.body.email}, secret);
                    console.log("Success find user");
                    res.status(201).json({create:true,message:"sucess find",token:token});
                    }
                  }
                  else {
                    console.log(req.body.password+" hash "+user.passwordHash+" valid password "+ valid);
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
});



router.get("/test", (req, res,next)=> {

    /*store testing data  */
    console.log("store testing data");
    var newActivities= new Activities({
     activityType: "walk",
     lats:      [115,116,117,119,120,121,130],
     lons:       [167.167,168,169,169,169,170],
     speeds:       [3,4,6,7,8,9,10],
     uvIndices:    [1,2,3,4,5,6,7],
     duration:     3600,
     calories:     1200, 
     uvExposure:    500,
     deviceId:      "UVFit2"
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
   //  var newuser=new User({

   //   email:  "UVFit1@gmail.com",
   //   fullName:    "UVFIt",
   //   passwordHash: "123",
   //   userDevices:  ["UVFit2","UVFit3"],
   //    uvThreshold:  12,
   //     loc:[-100.958063,20.240501],

   //  });
   // newuser.save( function(err, user) {
   //         if (err) {
   //            console.error(err);
   //             console.log("Fail store user data");      
               
   //         }
   //         else {
   //            console.log("success store user data");
            
   //         }
   //    });
    

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
              // Get a new apikey
              var  deviceApikey = getNewApikey();
              console.log("Register a new device"+req.body.deviceId);
               var NewDevice = new Device({
               userEmail: req.body.email,
               deviceId:req.body.deviceId,
                deviceName: req.body.deviceName,
                 apikey:  deviceApikey   
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


});
router.post("/activities/change", (req, res,next)=> {

         var deviceId=req.body.deviceId;
         var date=req.body.date;
         var type=req.body.type;

          Activities.update({deviceId:deviceId,timePublished:date},{$set:{activityType:type}},function(err,activitiy){
                if(err)
                  console.log(err);
                  else
                  {
                    console.log("success change activities ");
                    res.status(201).json( {registered: true, message: "Activities type change   to "+type}); 
                  }
          });

});

/*single activitiy view*/
router.post("/activities/single", (req, res,next)=> {

    var responseJson = { found:false,
                        activities:{},
                        message:""};
    var deviceId=req.body.deviceId;
    var date=req.body.date;
    Activities.findOne({deviceId:deviceId,timePublished:date},function(err,activities){
         if(err)
            {
                 res.status(400).json( {found: false, message: err+" db err"});
            }
            else{
                    if(activities!=null){
                     responseJson.message="Activities found.";
                
                    responseJson.activities={ 
                      "type": activities.activityType,
                      "date":activities.timePublished,
                      "duration": activities.duration,
                      "calories": activities.calories, 
                      "uvExposure":  activities.uvExposure,
                      "lats": activities.lats,
                      "lons":  activities.lons,
                       "speeds":activities.speeds,
                       "uvs": activities.uvIndices,
                        "times":activities.timestamps
                    };
                    console.log(activities.speeds+" this is bug single view");
                    console.log(responseJson)
                    res.status(201).json(responseJson);
                  }
                  else{
                      res.status(400).json( {found: false, message: err+" cannot find any record "});
                  }
            }

      });

});

// register device
router.post("/devices/change", (req, res,next)=> {

        var newDeviceId=req.body.newdeviceId;
        var email=req.body.email;
        var oldDeviceId=req.body.olddeviceId;
         // console.log("success change deviceid "+oldDeviceId+"1-1");
        User.update({email:email,userDevices:oldDeviceId},{$set:{"userDevices.$":newDeviceId}},function(err,user){
              if(err){
                    console.log(err);
                    res.status(400).json( {registered: false, message: err+" db error "});
              }
                  else
                  {
                       console.log("success change user deviceid "+oldDeviceId+"-1");
                                  Device.update({deviceId:oldDeviceId},{$set:{deviceId:newDeviceId}},function(err,user){
                                        if(err){
                                              console.log(err);
                                              res.status(400).json( {registered: false, message: err+" db error "});
                                        }
                                            else
                                            {
                                              console.log("success change device  deviceid "+oldDeviceId+"-1");
                                              res.status(201).json( {registered: true, message: "Activities type change   to "+newDeviceId}); 
                                            }
                             });
                    // res.status(201).json( {registered: true, message: "Activities type change   to "+newDeviceId}); 
                  }
        });
    


});


// change a deviceId
router.post("/activities/change", (req, res,next)=> {

         var deviceId=req.body.deviceId;
         var date=req.body.date;
         var type=req.body.type;

          Activities.update({deviceId:deviceId,timePublished:date},{$set:{activityType:type}},function(err,activitiy){
                if(err){
                  console.log(err);
                    res.status(400).json( {registered: false, message: err+" db error "});
                }
                  else
                  {
                    console.log("success change activities ");
                    res.status(201).json( {registered: true, message: "Activities type change   to "+type}); 
                  }
          });

});

/*single activitiy view*/
router.post("/activities/single", (req, res,next)=> {

    var responseJson = { found:false,
                        activities:{},
                        message:""};
    var deviceId=req.body.deviceId;
    var date=req.body.date;
    Activities.findOne({deviceId:deviceId,timePublished:date},function(err,activities){
         if(err)
            {
                 res.status(400).json( {found: false, message: err+" db err"});
            }
            else{
                    if(activities!=null){
                     responseJson.message="Activities found.";
                
                    responseJson.activities={ 
                      "type": activities.activityType,
                      "date":activities.timePublished,
                      "duration": activities.duration,
                      "calories": activities.calories, 
                      "uvExposure":  activities.uvExposure,
                      "lats": activities.lats,
                      "lons":  activities.lons,
                       "speeds":activities.speeds,
                       "uvs": activities.uvIndices,
                        "times":timestamps
                    };
                    console.log(activities.speeds+" this is bug single view");
                    console.log(responseJson)
                    res.status(201).json(responseJson);
                  }
                  else{
                      res.status(400).json( {found: false, message: err+" cannot find any record "});
                  }
            }

      });

});


// view data
router.post("/activities/list", (req, res,next)=> {
   
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
});


router.post("/activities/summary", (req, res)=> {

        var responseJson = {
        success: true,
        message: ""
         };
    //     var decodedToken;
    //     if (authenticateRecentEndpoint) {
    //     decodedToken = authenticateAuthToken(req);
    //     if (!decodedToken) {
    //         responseJson.success = false;
    //         responseJson.message = "Authentication failed";
    //         return res.status(401).json(responseJson);
    //     }
    // }
     var deviceId=req.body.deviceId;
     console.log(deviceId);
    // Find all potholes reported in the spcified number of days
    var summaryActivities = Activities.find({
        "deviceId":deviceId,
        "timePublished": 
        {
            $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
        }
    }).sort({ "date": -1 });

    summaryActivities.exec({}, function(err, activities) {
        if (err) {
            responseJson.success = false;
            responseJson.message = "Error accessing db.";
            console.log("cannot find any data  summary view");
            return res.status(400).send(JSON.stringify(responseJson));
        }
        else
        {
            var totalduration=0;
            var totalcalories=0;
            var totaluv=0;
            for( var oneActivity of activities){
                totalduration+=oneActivity.duration;
                totalcalories+=oneActivity.calories;
                totaluv+=oneActivity.uvExposure;
            }
            responseJson['totalduration']=totalduration;
            responseJson['totalcalories']=totalcalories;
            responseJson['totaluv']=totaluv;
            responseJson.message = "In the past 7 days, user summary activities ";
            return res.status(200).send(JSON.stringify(responseJson));
        }
   });
     

});

router.get("/activities/all", (req, res)=> {


        let responseJson = {
        success: true,
        user:[ {
         userName:"",
         deviceId:""
         }
         ],
        message: ""
         };
     
      let DeviceId=[{
          userName:"",
          deviceId:""
      }];

    var promise = new Promise(function (resolve, reject) {
          User.find({},function(err, cursor){

                if(err){
                       responseJson.success = false;
                       responseJson.message = "Error find user  on db.";
                       console.log("Error: find all users on db");
                     //  return res.status(400).send(JSON.stringify(responseJson));
                 }
                cursor.forEach( function(user) {
                   console.log("user "+user.fullName+"  deviceId"+user.userDevices);
                   if(user!=null){
                       DeviceId.push({
                          "userName": user.fullName,
                          "deviceId": user.userDevices
                       });
                         user.userDevices.forEach(function(deviceId){
                                  var userName=user.fullName;
                                 var deviceId=deviceId; 
                               console.log("for each  debug"+user.fullName+"  device ="+deviceId);
                                     var summaryActivities =  Activities.find({
                                            "deviceId":deviceId,
                                             "timePublished": 
                                          {
                                              $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                                          }
                                        }).sort({ "date": -1 });

                                      summaryActivities.exec({}, function(err, activities) {
                                                if (err) {
                                                  responseJson.success = false;
                                                  responseJson.message = "Error accessing db.";
                                                  console.log("cannot find any data  avg view");
                                                  res.status(400).send(JSON.stringify(responseJson));
                                                 }
                                               else{
                                                  var totalduration=0;
                                                  var totalcalories=0;
                                                  var totaluv=0;
                                                  var  count=0;
                                                  var totaldistance=0;
                                                  for( var oneActivity of activities){
                                                      totalduration+=oneActivity.duration;
                                                      totalcalories+=oneActivity.calories;
                                                      totaluv+=oneActivity.uvExposure;
                                                      count++;
                                                  }
                                                  responseJson.user.push({ 
                                                          "userName": userName,
                                                          "deviceId": deviceId,
                                                          "avgduration": totalduration/count,
                                                          "avgcalories":  totalcalories/count, 
                                                          "avguv":  totaluv/count,
                                                          "avgdistance": activities.avgSpeed*totalduration,
                                                          "totalactivities": count
                                                      });
                                      
                                                 resolve(responseJson);

                                              }
                                        });

                                     });

                     // var  userDevices=user.userDevices;
                     // processArray(userDevices,user.fullName,responseJson);
                     //   console.log("inside debug"+JSON.stringify(responseJson));
                    // // async(userDevices)=>{
                    //     for(var j=0;j<userDevices.length;j++){
                    //       console.log("user for loop"+user.fullName+"  deviceId"+userDevices[j]+"   j="+j);
                    //       let result;
                    //       if(userDevices[j]!=null) {
                       
                    //          result=await findAllUser(userDevices[j],user.fullName);
                         
                    //          responseJson.user.push(result);
                    //        }
                    //     }
                    // }
                  

                   }

                });
                  // console.log(responseJson);
                  // resolve(responseJson);

          });
    });

    promise.then(  function (responseJson) { 
          return new  Promise( async function (resolve, reject) {
               await delay(responseJson);
               // await delay1();
            responseJson.message = "In the past 7 days, user avg  activities ";
            console.log(responseJson);
             res.status(200).send(JSON.stringify(responseJson));
           });

    }).catch(() => { assert.isNotOk(error,'Promise error'); });

});


router.get("/activities/local", (req, res)=> {

    let responseJson = {
        success: true,
        user:[ {
         userName:"",
         deviceId:"",
         group: ""
         }
         ],
        message: ""
         };
     
      let Zip=[{}];
      let zipMap = new Map();

var promise = new Promise(function (resolve, reject) {
      User.find({},function(err, cursor){
            if(err){
                responseJson.success = false;
                responseJson.message = "Error find user  on db.";
                console.log("Error: find all users on db");
                     //  return res.status(400).send(JSON.stringify(responseJson));
                 }
                 var group=1;
                cursor.forEach( function(user) {
                   console.log(user.email+"test debug curosr loop");
               if(typeof(user.loc)!="undefined"&&typeof(user.loc)!="undefined"){
                  
                var findZipQuery = User.find({
                    loc: {
                         $near : {
                             $geometry: { type: "Point",  coordinates: [user.loc[0], user.loc[1]] },
                             $maxDistance: 1000.0
                         }
                     } 
                 });
                 findZipQuery.exec(function (err, ZipUser) {
                    if (err) {
                       console.log(err);
                       responseJson.message = "Error accessing db.";
                       return res.status(400).send(JSON.stringify(responseJson));
                     }
                        ZipUser.forEach( function(zip) {
                              if(zip&&user.email!=zip.email){
                                  Zip.push({
                                      'email':user.email,
                                       'group':group
                                  });
                                  Zip.push({
                                    'email':zip.email,
                                     'group': group
                                  });

                                   // zipMap[group]=user.email;
                                   // zipMap[group]=zip.email;         
                              }
                              else{
                                 Zip.push({
                                      'email':user.email,
                                       'group':group
                                  });
                              }
                              console.log("user longtitude"+user.loc[0]+"  map "+user.email+"   "+zip.email);
                       
                                resolve(Zip);
                         });
                           group=group+1;
                    });

                
                 
                }
              
             
          });
       });
  });
  promise.then(  function (Zip) { 
          return new  Promise( async function (resolve, reject) {
                await delay(Zip);
               console.log("iterator map ");
               // var Zip =JSON.parse(JSON.stringify(Zip));
               Zip.forEach(function (item) {
                            if(item.email==null||item.group==null)  return ;
                           // console.log("group "+key+"  email"+value);
                             console.log("group "+item.email+"  key "+item.group);
                           var key=item.group;
                           var value=item.email;
                      User.findOne({email: value},function(err, user){
                        if(err){
                               responseJson.success = false;
                               responseJson.message = "Error find user  on db.";
                               console.log("Error: find all users on db");
                               return res.status(400).send(JSON.stringify(responseJson));
                         }
                        // console.log("user "+user.fullName+"  deviceId"+user.userDevices);
                          if(user!=null){
                               console.log("user "+user.fullName+"  deviceId"+user.userDevices);
                              user.userDevices.forEach(function(deviceId){
                                          var userName=user.fullName;
                                         var deviceId=deviceId; 
                                          console.log("for each  debug local view "+user.fullName+"  device ="+deviceId);
                                             var summaryActivities =  Activities.find({
                                                    "deviceId":deviceId,
                                                     "timePublished": 
                                                  {
                                                      $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
                                                  }
                                                }).sort({ "date": -1 });

                                              summaryActivities.exec({}, function(err, activities) {
                                                        if (err) {
                                                          responseJson.success = false;
                                                          responseJson.message = "Error accessing db.";
                                                          console.log("cannot find any data  avg view");
                                                          res.status(400).send(JSON.stringify(responseJson));
                                                         }
                                                       else{
                                                          var totalduration=0;
                                                          var totalcalories=0;
                                                          var totaluv=0;
                                                          var  count=0;
                                                          var totaldistance=0;
                                                          for( var oneActivity of activities){
                                                              totalduration+=oneActivity.duration;
                                                              totalcalories+=oneActivity.calories;
                                                              totaluv+=oneActivity.uvExposure;
                                                              count++;
                                                          }
                                                          responseJson.user.push({ 
                                                                  "userName": userName,
                                                                  "deviceId": deviceId,
                                                                  "avgduration": totalduration/count,
                                                                  "avgcalories":  totalcalories/count, 
                                                                  "avguv":  totaluv/count,
                                                                  "avgdistance": activities.avgSpeed*totalduration,
                                                                  "totalactivities": count,
                                                                   "group": key
                                                              });
                                              
                                                         resolve(responseJson);

                                                      }
                                                });

                                             });
                           
                             }         
                          // resolve(responseJson);
                   });
                  
            });
      });
    }).then(function (responseJson) { 
           return new  Promise( async function (resolve, reject) {
               await delay(responseJson);
              responseJson.message = "In the past 7 days,   geographically local  user avg  activities ";
              console.log(responseJson);
              res.status(200).send(JSON.stringify(responseJson));
          });

    }).catch(() => { assert.isNotOk(error,'Promise error'); });

});
// Update Account
router.post("/account/update", (req, res)=> {
	console.log("inside account update server side");
	if (!req.headers["x-auth"]) {
      res.status(400).json({success: false, message: "No authentication token"});
	}
	var token;
	var authToken = req.headers["x-auth"];
	var decodedToken = jwt.decode(authToken, secret);
	// query by email
	User.findOne({email: decodedToken.email}, function(err, user) {
		console.log("found user email "+user.email);
		if(err) {
			res.status(400).json({success: false, message: "User does not exist."});
		}
		else {
			// verify password
			bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
				console.log("valid password? "+ valid);				
				console.log("new name "+req.body.name);
                if(err){					 
                    res.status(400).json({create:false,message:"Error authenticating. Please contact support."}); 
                }
				// update email, name, and password
				else {
					if(valid){	
						user.fullName = req.body.name;
						user.save(function (err, user) {
							console.log("updated name");
						});
						// use same email if it does not change
						console.log("new email "+req.body.newemail+" server email "+user.email);
						if (req.body.newemail != user.email){
							user.email = req.body.newemail;
							user.save(function (err, user) {
								console.log("updated email");
							});
							// create new token
							token = jwt.encode({email: req.body.email}, secret);
						}
            if(req.body.newpassword!=null){ //not need to update password
      						// hash new password
      						bcrypt.hash(req.body.newpassword, null, null, function(err, hash) {
      							user.passwordHash = hash;
      							user.save(function (err, user) {
      									console.log("updated password");
      							});
      						});
              }
						// update token if new and old emails are different
						if (req.body.newemail != user.email){
							res.status(201).json({updated: true, message:"Account updated successfully.", token:token});
						}
						else {
							res.status(201).json({updated: true, message:"Account updated successfully."});
						}
					}
				}
			});
		}

	});
});


module.exports = router;
