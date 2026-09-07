const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db'); // this also runs the connection test

const patientRoutes = require('./routes/patientRoutes'); //connect routes to the server
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labReportRoutes = require('./routes/labReportRoutes');
const authRoutes = require('./routes/authRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // allows server to read JSON data sent in requests

app.use('/', patientRoutes);
app.use('/', medicalRecordRoutes);
app.use('/', prescriptionRoutes);
app.use('/', labReportRoutes);
app.use('/', authRoutes);
app.use('/', auditRoutes);

// Simple test route
app.get('/', (req, res) => {
    res.send('Medical Record System backend is running ✅');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});