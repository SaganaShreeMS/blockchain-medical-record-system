const express = require('express');
const router = express.Router();
const { addPrescription, getPrescriptionsByRecord } = require('../controllers/prescriptionController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.post('/prescriptions', verifyToken, allowRoles('Doctor', 'Pharmacy', 'Admin'), addPrescription);
router.get('/prescriptions/record/:recordId', verifyToken, allowRoles('Doctor', 'Pharmacy', 'Admin'), getPrescriptionsByRecord);

module.exports = router;