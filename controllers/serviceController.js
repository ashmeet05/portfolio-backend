const Service = require('../models/service');

exports.getAll = async (req, res, next) => {
  try {
    const items = await Service.find();
    res.json({
      success: true,
      message: 'Services list retrieved successfully.',
      data: items.map(i => ({ ...i.toObject(), id: i._id, _id: undefined }))
    });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await Service.findById(req.params.id);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.json({ success: true, message: 'Service retrieved successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Service.create(req.body);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(201).json({ success: true, message: 'Service added successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: 'Service updated successfully.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) { next(err); }
};