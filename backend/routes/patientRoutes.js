const express = require('express');
const router = express.Router();
const { addPatient, getPatient } = require('../controllers/patientController');

router.post('/patients', addPatient);
router.get('/patients/:id', getPatient);

module.exports = router;
