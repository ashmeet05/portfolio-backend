const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/referenceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

// References contain other people's contact details, so only admins can see them.
router.use(requireAuth, requireAdmin);
router.get('/', ctrl.getAll);
router.get('/:id', validateId, ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

module.exports = router;
