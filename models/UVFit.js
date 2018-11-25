
var db = require("../db");

var userSchema = new db.Schema({
  email:        { type: String, required: true, unique: true },
  fullName:     { type: String, required: true },
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
     timestamps:   [ Number ],
     deviceId:      String,
     timePublished:{ type: Date, default: Date.now }
});

//this should be changed to Activity
const Activities=db.model('Activities', activitySchema);
module.exports.Activities= Activities;



