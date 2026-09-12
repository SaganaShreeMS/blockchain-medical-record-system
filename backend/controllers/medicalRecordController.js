const db = require('../config/db');
const { recordLog, hashRecordContent, storeRecordHash, getRecordHash } = require('../config/blockchain');

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

        const recordId = result.insertId;

        recordLog(patient_id, req.user.department, 'ADD_MEDICAL_RECORD');

        const contentHash = hashRecordContent([
            String(patient_id),
            diagnosis,
            doctor_notes || ''
        ]);
        storeRecordHash(`medical_record:${recordId}`, contentHash, req.user.department);

        res.status(201).json({
            message: 'Medical record added successfully',
            recordId: recordId
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

        recordLog(patientId, req.user.department, 'VIEW_MEDICAL_RECORDS');

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching medical records' });
    }
};

const verifyMedicalRecord = async (req, res) => {
    try {
        const { recordId } = req.params;

        const [rows] = await db.query('SELECT * FROM medical_records WHERE id = ?', [recordId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Medical record not found' });
        }

        const record = rows[0];

        const currentHash = hashRecordContent([
            String(record.patient_id),
            record.diagnosis,
            record.doctor_notes || ''
        ]);

        const storedHash = await getRecordHash(`medical_record:${recordId}`);

        const ZERO_HASH = '0x' + '0'.repeat(64);
        const hasBaseline = storedHash.toLowerCase() !== ZERO_HASH;

        if (!hasBaseline) {
            return res.status(200).json({
                recordId: Number(recordId),
                verified: null,
                currentHash,
                storedHash,
                message: 'No blockchain fingerprint exists for this record — it was likely created before integrity hashing was added.'
            });
        }

        const matches = storedHash.toLowerCase() === currentHash.toLowerCase();

        res.status(200).json({
            recordId: Number(recordId),
            verified: matches,
            currentHash,
            storedHash,
            message: matches
                ? 'This record matches its original blockchain fingerprint — no tampering detected.'
                : 'WARNING: This record does NOT match its blockchain fingerprint. The content may have been altered outside the application.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while verifying record' });
    }
};

module.exports = { addMedicalRecord, getMedicalRecordsByPatient, verifyMedicalRecord };