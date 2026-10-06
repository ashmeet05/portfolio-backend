const mongoose = require('mongoose');
const applyToJSON = require('../utils/toJSON');

const referenceSchema = new mongoose.Schema({
  firstname: { type: String, trim: true, maxlength: 100 },
  lastname: { type: String, trim: true, maxlength: 100 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254 },
  position: { type: String, trim: true, maxlength: 200 },
  company: { type: String, trim: true, maxlength: 200 }
});

applyToJSON(referenceSchema);

module.exports = mongoose.model('Reference', referenceSchema);
