const User = require('../models/user');

const FIELDS = ['firstname', 'lastname', 'email', 'password'];
const pick = (body) => {
  const out = {};
  for (const f of FIELDS) if (body && body[f] !== undefined) out[f] = body[f];
  return out;
};

// Admins can manage anyone; other users can only manage their own account.
const canManage = (req) => req.user.isAdmin || req.user.id === req.params.id;
const forbidden = (res) =>
  res.status(403).json({ success: false, message: 'You do not have permission to do this.' });

exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, message: 'Users list retrieved successfully.', data: users });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    if (!canManage(req)) return forbidden(res);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User retrieved successfully.', data: user });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const user = await User.create(pick(req.body));
    res.status(201).json({ success: true, message: 'User added successfully.', data: user });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    if (!canManage(req)) return forbidden(res);
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const changes = pick(req.body);
    // An empty password box in the form means "keep the current password".
    if (changes.password === '') delete changes.password;
    Object.assign(user, changes);
    await user.save(); // save() runs validation and hashes the password

    res.json({ success: true, message: 'User updated successfully.', data: user });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!canManage(req)) return forbidden(res);
    const result = await User.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) { next(err); }
};
