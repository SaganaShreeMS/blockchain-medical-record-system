
const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/auth/signup', verifyToken, allowRoles('Admin'), signup);
router.post('/auth/login', login);

module.exports = router;