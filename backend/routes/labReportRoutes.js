const express = require('express');
const router = express.Router();
const { addLabReport, getLabReportsByPatient } = require('../controllers/labReportController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/lab-reports', verifyToken, allowRoles('Laboratory', 'Doctor', 'Admin'), addLabReport);
router.get('/lab-reports/patient/:patientId', verifyToken, allowRoles('Laboratory', 'Doctor', 'Admin'), getLabReportsByPatient);

module.exports = router;