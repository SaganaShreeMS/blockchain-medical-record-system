const { getAllLogs } = require('../config/blockchain');

const getAuditLogs = async (req, res) => {
    try {
        const logs = await getAllLogs();

        // Show most recent first
        const sortedLogs = logs.reverse();

        res.status(200).json(sortedLogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching audit logs' });
    }
};

module.exports = { getAuditLogs };