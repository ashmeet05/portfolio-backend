const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

// Every user route needs a login. Listing and creating users is admin-only;
// a normal user can view, edit or delete only their own account.
router.use(requireAuth);
router.get('/', requireAdmin, ctrl.getAll);
router.post('/', requireAdmin, ctrl.create);
router.get('/:id', validateId, ctrl.getById);
router.put('/:id', validateId, ctrl.update);
router.delete('/:id', validateId, ctrl.remove);

module.exports = router;
