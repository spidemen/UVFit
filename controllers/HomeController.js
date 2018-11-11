const express = require("express");
var Device = require("../models/UVFit").Device;
var Activities = require("../models/UVFit").Activities;
var User = require("../models/UVFit").User;
const router = express.Router();


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


router.post("/account/login", (req, res)=> {
    
    
    console.log(req.body.email+"   "+req.body.password);
    User.findOne({email:req.body.email},function(err,user)
      {
          if(err)
          {
                 console.log("can not find users");
                 res.status(400).json({create:false,message:"Canot find users"});

          }
          else
          {
              console.log("user email: "+user.email);
              if(req.body.password==user.passwordHash)
              {
               console.log("Success find user");
               res.status(201).json({create:true,message:"sucess find"});
             }else
              res.status(400).json({create:false,message:"username and password do not match"});
          }

      });
   // res.status(201).json({message:"testing"});
   // res.render("login");
})



router.post("/test", (req, res,next)=> {

    /*store testing data  */
    console.log("store testing data");
    var newActivities= new Activities({
     activityType: "walk",
     lats:      115,
     lons:       167,
     speeds:       3,
     uvIndices:    2,
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
    Device.findOne({email:req.body.deviceId}, function(err, device) {
        if(!err)
        {
            console.log("Already registered");
            res.status(201).json( {registered: false, message: "Device ID="+req.body.deviceId+" already registered"});
        }
        else
          {
          var NewDevice = new Device({
           userEmail: req.body.email,
           deviceId:req.body.deviceId,
           deviceName: req.body.deviceName
           }); 
            NewDevice.save( function(err, device) {
           if (err) {
            // 	console.error(err);
               console.log("Fail store");
              res.status(400).json( {registered: false, message: err.errmsg});
               
           }
           else {
           	  console.log("success store");
              res.status(201).json( {registered: true, message: "Device ID:"+req.body.deviceId + " was registered."})     
           }
        });
      }
      });


})

// view data
router.get("/activities/user", (req, res,next)=> {
   
    var responseJson = { found:false,
                        activities:[
                        {type: "",
                         lons: [],
                         lats:[],
                       
                         uv:[],
                         date:[]
                       }
                        ],
                       message:""};
       /*       
     var responseJson = { found:false,
                        activities:[  ],
                       message:""};
*/
    
    console.log(req.body.email+"   "+req.body.deviceId);
    User.findOne({email:"demo@email.com"}, function(err,user){
        if(err)
        {
             res.status(400).json( {found: false, message: err.errmsg+"  user email do not exit, please create account first"});
        }
       else
       {
         console.log(user.userDevices);
         Activities.find({deviceId:user.userDevices[0]},function(err,activities)
          {
            if(err)
            {
                res.status(400).json( {found: false, message: err.errmsg+" can not find any activities record"});
            }
            else
            {
                responseJson.found=true;
                responseJson.message="Activities found.";
               
                for(var act of  activities)
                {
                  responseJson.activities.push({ 
                      "type": act.activityType,
                       "lons":act.lons,
                       "lats":act.lats,
              
                        "uv":act.uvIndices,
                       "date":act.timePublished
                  });
                }
                 console.log(responseJson);
                res.status(201).json(responseJson);
            }
          });

       }
    });
   // res.render("profile");
})

module.exports = router;
