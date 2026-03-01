const Reference = require('../models/reference');

exports.getAll = async (req, res, next) => {
  try {
    const items = await Reference.find();
    res.json({
      success: true,
      message: 'References list retrieved successfully.',
      data: items.map(i => ({ ...i.toObject(), id: i._id, _id: undefined }))
    });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await Reference.findById(req.params.id);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.json({ success: true, message: 'Reference retrieved successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Reference.create(req.body);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(201).json({ success: true, message: 'Reference added successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    await Reference.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: 'Reference updated successfully.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Reference.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reference deleted successfully.' });
  } catch (err) { next(err); }
};