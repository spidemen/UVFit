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
    
    
  //  console.log(req.body.email+"   "+req.body.password);
    User.findOne({email:req.body.email},function(err,user)
      {
          if(err)
          {
                
            res.status(400).json({create:false,message:err.errmsg+" db error"});

          }
          else
          {

              if(user!=null)
              {
               console.log("user email: "+user.email);
               if(req.body.password==user.passwordHash)
               {
               console.log("Success find user");
               res.status(201).json({create:true,message:"sucess find"});
              }
              else
              res.status(400).json({create:false,message:"username and password do not match"});
            }
            else
            {
                 res.status(400).json({create:false,message:"No any record find, please do create."});
            }
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
                   res.status(400).json( {registered: false, message: err.errmsg+" db error fail create"});
               
                 }
                 else {
                 console.log("success store");
                 res.status(201).json( {registered: true, message: "Device ID:"+req.body.deviceId + " was registered."})     
               }
               });
          }
        }
        else
        {       
            res.status(400).json( {registered: false, message: err.errmsg+" db error "});
         
         }
      });


})

// view data
router.post("/activities/user", (req, res,next)=> {
   
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
 //   var Email="demo@email.com";
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
        else
        {
           res.status(400).json( {found: false, message: err+"  user email do not exit, please create account first"});
        }

      }

    });
   // res.render("profile");
})

module.exports = router;
