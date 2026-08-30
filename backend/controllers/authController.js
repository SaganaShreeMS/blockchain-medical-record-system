const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /auth/signup — create a new staff user
const signup = async (req, res) => {
    try {
        const { username, password, department } = req.body;

        const validDepartments = ['Reception', 'Doctor', 'Laboratory', 'Pharmacy', 'Admin'];

        if (!username || !password || !department) {
            return res.status(400).json({ error: 'username, password, and department are required' });
        }

        if (!validDepartments.includes(department)) {
            return res.status(400).json({ error: `department must be one of: ${validDepartments.join(', ')}` });
        }

        // Hash the password before storing — never store plain text
        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (username, password_hash, department) VALUES (?, ?, ?)',
            [username, passwordHash, department]
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error while creating user' });
    }
};

// POST /auth/login — verify credentials and issue a token
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'username and password are required' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];

        // Compare submitted password against stored hash
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create a token containing the user's id and department
        const token = jwt.sign(
            { id: user.id, username: user.username, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            department: user.department
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
};

module.exports = { signup, login };
