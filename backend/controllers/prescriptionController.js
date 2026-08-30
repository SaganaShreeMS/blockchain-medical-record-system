const db = require('../config/db');

const addPrescription = async (req, res) => {
    try {
        const { medical_record_id, medicine_name, dosage, duration } = req.body;

        if (!medical_record_id || !medicine_name) {
            return res.status(400).json({ error: 'medical_record_id and medicine_name are required' });
        }

        const [result] = await db.query(
            'INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, duration) VALUES (?, ?, ?, ?)',
            [medical_record_id, medicine_name, dosage, duration]
        );

        res.status(201).json({
            message: 'Prescription added successfully',
            prescriptionId: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while adding prescription' });
    }
};

const getPrescriptionsByRecord = async (req, res) => {
    try {
        const { recordId } = req.params;

        const [rows] = await db.query(
            'SELECT * FROM prescriptions WHERE medical_record_id = ?',
            [recordId]
        );

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching prescriptions' });
    }
};

module.exports = { addPrescription, getPrescriptionsByRecord };
