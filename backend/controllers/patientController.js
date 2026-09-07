const db = require('../config/db');

const QRCode = require('qrcode'); //generation of qr as a base64 img

const { recordLog } = require('../config/blockchain');

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

        recordLog(id, req.user.department, 'VIEW_PATIENT');

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching patient' });
    }
};


// GET /patients/:id/qrcode — generate a QR code encoding this patient's ID
const getPatientQRCode = async (req, res) => {
    try {
        const { id } = req.params;

        // Confirm the patient actually exists before generating a QR for them
        const [rows] = await db.query('SELECT id, name FROM patients WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // The QR encodes just the patient ID — scanning it later will call GET /patients/:id
        const qrData = JSON.stringify({ patientId: rows[0].id });

        const qrImageDataUrl = await QRCode.toDataURL(qrData);

        res.status(200).json({
            patientId: rows[0].id,
            name: rows[0].name,
            qrCode: qrImageDataUrl // a base64 image string, ready to use in an <img> tag later
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while generating QR code' });
    }
};

module.exports = { addPatient, getPatient, getPatientQRCode };
