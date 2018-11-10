

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/UVFit", { useNewUrlParser: true });

module.exports = mongoose;