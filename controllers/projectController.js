const Project = require('../models/projects');
module.exports = require('./crudController')(Project, 'Project', ['title', 'completion', 'description']);
