const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

router.post('/signup', ctrl.signup);
router.post('/signin', ctrl.signin);

module.exports = router;
