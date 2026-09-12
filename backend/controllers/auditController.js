const { getAllLogs, verifyLogChain } = require('../config/blockchain');

const getAuditLogs = async (req, res) => {
    try {
        const logs = await getAllLogs();
        const sortedLogs = logs.reverse();
        res.status(200).json(sortedLogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching audit logs' });
    }
};

const verifyChain = async (req, res) => {
    try {
        const result = await verifyLogChain();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while verifying log chain' });
    }
};

module.exports = { getAuditLogs, verifyChain };