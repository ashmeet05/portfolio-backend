const mongoose = require('mongoose');
const applyToJSON = require('../utils/toJSON');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  completion: Date,
  description: { type: String, trim: true, maxlength: 5000 }
});

applyToJSON(projectSchema);

module.exports = mongoose.model('Project', projectSchema);
