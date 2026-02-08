const bcrypt = require('bcrypt');
const User = require('../model/user');

const updateProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            email,
            currentPassword,
            newPassword,
            confirmNewPassword,
        } = req.body || {};

        if (!email && !newPassword) {
            return res.status(400).json({ error: 'Nothing to update' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If changing password, require current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required' });
            }
            const ok = await bcrypt.compare(String(currentPassword), user.password);
            if (!ok) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            if (typeof newPassword !== 'string' || newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters' });
            }
            if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }

            const hashed = await bcrypt.hash(String(newPassword), 10);
            user.password = hashed;
        }

        // If changing email
        if (email) {
            const nextEmail = String(email).trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(nextEmail)) {
                return res.status(400).json({ error: 'Invalid email address' });
            }

            if (nextEmail !== user.email) {
                const exists = await User.findOne({ email: nextEmail });
                if (exists) {
                    return res.status(400).json({ error: 'Email already in use' });
                }
                user.email = nextEmail;
            }
        }

        await user.save();

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
            },
            message: 'Profile updated successfully',
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    updateProfile,
};
