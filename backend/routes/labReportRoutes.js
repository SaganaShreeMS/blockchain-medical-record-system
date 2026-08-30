const express = require('express');
const router = express.Router();
const { addLabReport, getLabReportsByPatient } = require('../controllers/labReportController');

router.post('/lab-reports', addLabReport);
router.get('/lab-reports/patient/:patientId', getLabReportsByPatient);

module.exports = router;
