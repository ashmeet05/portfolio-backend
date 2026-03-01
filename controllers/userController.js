const User = require('../models/user');

exports.getAll = async (req, res, next) => {
  try {
    const items = await User.find();
    res.json({
      success: true,
      message: 'Users list retrieved successfully.',
      data: items.map(i => ({ ...i.toObject(), id: i._id, _id: undefined }))
    });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await User.findById(req.params.id);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.json({ success: true, message: 'User retrieved successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await User.create(req.body);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(201).json({ success: true, message: 'User added successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) { next(err); }
};