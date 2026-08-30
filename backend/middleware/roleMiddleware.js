const allowRoles = (...allowedDepartments) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!allowedDepartments.includes(req.user.department)) {
            return res.status(403).json({
                error: `Access denied. This action requires one of: ${allowedDepartments.join(', ')}`
            });
        }

        next(); // department is allowed, proceed
    };
};

module.exports = allowRoles;
