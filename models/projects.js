const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  completion: Date,
  description: String
});

module.exports = mongoose.model('Project', projectSchema);