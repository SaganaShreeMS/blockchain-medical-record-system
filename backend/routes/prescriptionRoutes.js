const express = require('express');
const router = express.Router();
const { addPrescription, getPrescriptionsByRecord } = require('../controllers/prescriptionController');

router.post('/prescriptions', addPrescription);
router.get('/prescriptions/record/:recordId', getPrescriptionsByRecord);

module.exports = router;
