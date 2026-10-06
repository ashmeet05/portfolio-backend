const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/serviceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

// Anyone can view; only admins can change.
router.get('/', ctrl.getAll);
router.get('/:id', validateId, ctrl.getById);
router.post('/', requireAuth, requireAdmin, ctrl.create);
router.put('/:id', validateId, requireAuth, requireAdmin, ctrl.update);
router.delete('/:id', validateId, requireAuth, requireAdmin, ctrl.remove);

module.exports = router;
