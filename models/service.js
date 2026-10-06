const mongoose = require('mongoose');
const applyToJSON = require('../utils/toJSON');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 5000 }
});

applyToJSON(serviceSchema);

module.exports = mongoose.model('Service', serviceSchema);
