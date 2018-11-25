
var db = require("../db");

var userSchema = new db.Schema({
  email:        { type: String, required: true, unique: true },
  fullName:     { type: String, required: true },
  isVerified: { type: Boolean, default: false },
   passwordHash: String,
   lastAccess:   { type: Date, default: Date.now },
  userDevices:  [ String ],
  uvThreshold:  Number
});

const User=db.model('User', userSchema);
module.exports.User= User;

var deviceSchema =new  db.Schema({
  apikey:       String,
  deviceId:     String,
  deviceName:  String,
  userEmail:    String,
  lastContact:  { type: Date, default: Date.now }
});

const Device=db.model('Device', deviceSchema);
module.exports.Device = Device;

var activitySchema =new db.Schema({
     activityType: String,
     lats:         [ Number ],
     lons:         [ Number ],
     speeds:       [ Number ],
     uvIndices:    [ Number ],
     timestamps:   [ Date ],
     duration:     Number,
     calories:     Number, 
     uvExposure:    Number,
     deviceId:      String,
     timePublished:{ type: Date, default: Date.now }
});

//this should be changed to Activity
const Activities=db.model('Activities', activitySchema);
module.exports.Activities= Activities;

var tokenSchema = new db.Schema({
    _userId: { type: db.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 120 }
});
const token=db.model('token', tokenSchema);
module.exports.token= token;


