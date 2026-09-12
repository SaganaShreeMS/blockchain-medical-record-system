const express = require('express');
const router = express.Router();
const { getAuditLogs, verifyChain } = require('../controllers/auditController');
const verifyToken = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

router.get('/audit-logs', verifyToken, allowRoles('Admin'), getAuditLogs);
router.get('/audit-logs/verify-chain', verifyToken, allowRoles('Admin'), verifyChain);

module.exports = router;