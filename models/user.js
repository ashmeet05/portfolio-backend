const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const applyToJSON = require('../utils/toJSON');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true, trim: true, maxlength: 100 },
  lastname: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.']
  },
  // select: false means the password hash is never loaded unless asked for.
  password: { type: String, required: true, minlength: 8, select: false },
  created: { type: Date, default: Date.now, immutable: true },
  updated: { type: Date, default: Date.now }
});

// Always hash the password before it is stored.
userSchema.pre('save', async function () {
  this.updated = new Date();
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

applyToJSON(userSchema);

module.exports = mongoose.model('User', userSchema);
