const Service = require('../models/service');
module.exports = require('./crudController')(Service, 'Service', ['title', 'description']);
