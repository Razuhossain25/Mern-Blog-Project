const Settings = require('../model/settings');
const fs = require('fs');
const path = require('path');

const safeUnlink = async (absoluteFilePath) => {
    if (!absoluteFilePath) return;
    try {
        await fs.promises.unlink(absoluteFilePath);
    } catch (err) {
        if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) return;
        throw err;
    }
};

const uploadsPathFor = (fileName) => {
    if (!fileName) return '';
    return path.join(__dirname, '..', 'public', 'uploads', fileName);
};

const getOrCreateSettings = async () => {
    let settings = await Settings.findOne({});
    if (!settings) {
        settings = await Settings.create({});
    }
    return settings;
};

const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        return res.status(200).json(settings);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();

        const body = req.body || {};
        const websiteTitle = typeof body.websiteTitle === 'string' ? body.websiteTitle : undefined;
        const themeColor = typeof body.themeColor === 'string' ? body.themeColor : undefined;

        const mobile = typeof body.mobile === 'string' ? body.mobile : undefined;
        const email = typeof body.email === 'string' ? body.email : undefined;
        const address = typeof body.address === 'string' ? body.address : undefined;

        if (websiteTitle !== undefined) settings.websiteTitle = websiteTitle;
        if (themeColor !== undefined) settings.themeColor = themeColor;

        if (mobile !== undefined) settings.contact.mobile = mobile;
        if (email !== undefined) settings.contact.email = email;
        if (address !== undefined) settings.contact.address = address;

        const files = req.files || {};
        const logoFile = files.logo?.[0];
        const faviconFile = files.favicon?.[0];

        if (logoFile) {
            const previous = settings.logo;
            settings.logo = logoFile.filename;
            if (previous && previous !== settings.logo) {
                await safeUnlink(uploadsPathFor(previous));
            }
        }

        if (faviconFile) {
            const previous = settings.favicon;
            settings.favicon = faviconFile.filename;
            if (previous && previous !== settings.favicon) {
                await safeUnlink(uploadsPathFor(previous));
            }
        }

        const updated = await settings.save();
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
