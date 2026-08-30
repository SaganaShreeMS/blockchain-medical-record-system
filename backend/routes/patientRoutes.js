const express = require('express');
const router = express.Router();
const { addPatient, getPatient, getPatientQRCode } = require('../controllers/patientController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/patients', verifyToken, allowRoles('Reception', 'Doctor', 'Admin'), addPatient);
router.get('/patients/:id', verifyToken, allowRoles('Reception', 'Doctor', 'Laboratory', 'Pharmacy', 'Admin'), getPatient);
router.get('/patients/:id/qrcode', verifyToken, allowRoles('Reception', 'Doctor', 'Admin'), getPatientQRCode);

module.exports = router;