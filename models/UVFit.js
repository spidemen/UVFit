var userSchema = new db.Schema({
  email:        { type: String, required: true, unique: true },
  fullName:     { type: String, required: true },
  passwordHash: String,
  lastAccess:   { type: Date, default: Date.now },
  userDevices:  [ String ],
  uvThreshold:  Number
});
