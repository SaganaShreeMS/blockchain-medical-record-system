const db = require('../config/db');

// POST /patients — add a new patient
const addPatient = async (req, res) => {
    try {
        const { name, age, gender, phone, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const [result] = await db.query(
            'INSERT INTO patients (name, age, gender, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, age, gender, phone, address]
        );

        res.status(201).json({
            message: 'Patient added successfully',
            patientId: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while adding patient' });
    }
};

// GET /patients/:id — fetch one patient by ID
const getPatient = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching patient' });
    }
};

module.exports = { addPatient, getPatient };
