var mongoose = require("mongoose");
var productSchema = new mongoose.Schema({
  name: String,
  value: Number,
  weight: Number,
  email: String
});
module.exports = mongoose.model("product",productSchema);
