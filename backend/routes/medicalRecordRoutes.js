const express = require('express');
const router = express.Router();
const { addMedicalRecord, getMedicalRecordsByPatient } = require('../controllers/medicalRecordController');

router.post('/medical-records', addMedicalRecord);
router.get('/medical-records/patient/:patientId', getMedicalRecordsByPatient);

module.exports = router;
