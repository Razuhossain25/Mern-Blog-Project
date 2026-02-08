const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
    const { email = '', password = '' } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }else if (!await bcrypt.compare(password, user.password)) {
            throw new Error('Invalid password');
        }else {
            const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.status(200).json({ token });
        }
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const checkAuth = async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ success: true, user: decoded.user });
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}


module.exports = {
    login,
    checkAuth
};