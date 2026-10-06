const Reference = require('../models/reference');
module.exports = require('./crudController')(Reference, 'Reference', ['firstname', 'lastname', 'email', 'position', 'company']);
