const express = require('express');
const router = express.Router();
const { addPatient, getPatient } = require('../controllers/patientController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/patients', verifyToken, allowRoles('Reception', 'Doctor', 'Admin'), addPatient);
router.get('/patients/:id', verifyToken, allowRoles('Reception', 'Doctor', 'Admin'), getPatient);

module.exports = router;