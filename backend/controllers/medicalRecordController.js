const db = require('../config/db');

const addMedicalRecord = async (req, res) => {
    try {
        const { patient_id, diagnosis, doctor_notes } = req.body;

        if (!patient_id || !diagnosis) {
            return res.status(400).json({ error: 'patient_id and diagnosis are required' });
        }

        const [result] = await db.query(
            'INSERT INTO medical_records (patient_id, diagnosis, doctor_notes) VALUES (?, ?, ?)',
            [patient_id, diagnosis, doctor_notes]
        );

        res.status(201).json({
            message: 'Medical record added successfully',
            recordId: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while adding medical record' });
    }
};

const getMedicalRecordsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        const [rows] = await db.query(
            'SELECT * FROM medical_records WHERE patient_id = ?',
            [patientId]
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching medical records' });
    }
};

module.exports = { addMedicalRecord, getMedicalRecordsByPatient };