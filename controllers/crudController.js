// Builds list/get/create/update/delete handlers for a simple model.
// Only the listed fields can be written, so nobody can sneak in extra data.
const pick = (body, fields) => {
  const out = {};
  for (const f of fields) {
    if (body && body[f] !== undefined) out[f] = body[f];
  }
  return out;
};

module.exports = (Model, label, fields) => ({
  getAll: async (req, res, next) => {
    try {
      const items = await Model.find();
      res.json({ success: true, message: `${label}s list retrieved successfully.`, data: items });
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: `${label} not found.` });
      res.json({ success: true, message: `${label} retrieved successfully.`, data: item });
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const item = await Model.create(pick(req.body, fields));
      res.status(201).json({ success: true, message: `${label} added successfully.`, data: item });
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, pick(req.body, fields), {
        returnDocument: 'after',
        runValidators: true
      });
      if (!item) return res.status(404).json({ success: false, message: `${label} not found.` });
      res.json({ success: true, message: `${label} updated successfully.`, data: item });
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: `${label} not found.` });
      res.json({ success: true, message: `${label} deleted successfully.` });
    } catch (err) { next(err); }
  }
});
