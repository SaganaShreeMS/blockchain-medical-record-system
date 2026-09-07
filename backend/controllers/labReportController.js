const db = require('../config/db');
const { recordLog } = require('../config/blockchain');

const addLabReport = async (req, res) => {
    try {
        const { patient_id, test_name, result, report_date } = req.body;

        if (!patient_id || !test_name) {
            return res.status(400).json({ error: 'patient_id and test_name are required' });
        }

        const [insertResult] = await db.query(
            'INSERT INTO lab_reports (patient_id, test_name, result, report_date) VALUES (?, ?, ?, ?)',
            [patient_id, test_name, result, report_date]
        );

        recordLog(patient_id, req.user.department, 'ADD_LAB_REPORT');

        res.status(201).json({
            message: 'Lab report added successfully',
            reportId: insertResult.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while adding lab report' });
    }
};

const getLabReportsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        const [rows] = await db.query(
            'SELECT * FROM lab_reports WHERE patient_id = ?',
            [patientId]
        );

        recordLog(patientId, req.user.department, 'VIEW_LAB_REPORTS');

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching lab reports' });
    }
};

module.exports = { addLabReport, getLabReportsByPatient };