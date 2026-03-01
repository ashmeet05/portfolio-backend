const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  position: String,
  company: String
});

module.exports = mongoose.model('Reference', referenceSchema);