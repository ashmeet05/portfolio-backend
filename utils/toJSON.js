// Shared JSON shape for all models: expose `id` (and keep `_id` for older
// frontend code), and never send internal or secret fields to the browser.
module.exports = function applyToJSON(schema) {
  schema.set('toJSON', {
    versionKey: false,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret.password;
      return ret;
    }
  });
};
