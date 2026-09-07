const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

// Only Admin can view the full audit trail
router.get('/audit-logs', verifyToken, allowRoles('Admin'), getAuditLogs);

module.exports = router;