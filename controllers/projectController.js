const Project = require('../models/projects');

exports.getAll = async (req, res, next) => {
  try {
    const items = await Project.find();
    res.json({
      success: true,
      message: 'Projects list retrieved successfully.',
      data: items.map(i => ({ ...i.toObject(), id: i._id, _id: undefined }))
    });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await Project.findById(req.params.id);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.json({ success: true, message: 'Project retrieved successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Project.create(req.body);
    const obj = item.toObject();
    obj.id = obj._id;
    delete obj._id;
    res.status(201).json({ success: true, message: 'Project added successfully.', data: obj });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, message: 'Project updated successfully.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) { next(err); }
};