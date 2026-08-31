const express = require('express');
const router = express.Router();
const { addMedicalRecord, getMedicalRecordsByPatient } = require('../controllers/medicalRecordController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/medical-records', verifyToken, allowRoles('Doctor', 'Admin'), addMedicalRecord);
router.get('/medical-records/patient/:patientId', verifyToken, allowRoles('Doctor', 'Pharmacy', 'Admin'), getMedicalRecordsByPatient);

module.exports = router;