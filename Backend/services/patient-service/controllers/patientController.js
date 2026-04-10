const Patient = require('../models/Patient.js');


// GET - Get patient profile
exports.getProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST - Create patient profile
exports.createProfile = async (req, res) => {
    try {
        const existing = await Patient.findOne({ userId: req.user.userId });
        if (existing) {
            return res.status(400).json({ message: 'Profile already exists' });
        }

        const patient = new Patient({
            userId: req.user.userId,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            address: req.body.address,
            medicalHistory: req.body.medicalHistory,
            bloodType: req.body.bloodType
        });

        const saved = await patient.save();
        res.status(201).json({ message: 'Profile created successfully', patient: saved });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT - Update patient profile
exports.updateProfile = async (req, res) => {
    try {
        const updated = await Patient.findOneAndUpdate(
            { userId: req.user.userId },
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                dateOfBirth: req.body.dateOfBirth,
                gender: req.body.gender,
                address: req.body.address,
                medicalHistory: req.body.medicalHistory,
                bloodType: req.body.bloodType
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully', patient: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST - Upload medical report
exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const patient = await Patient.findOneAndUpdate(
            { userId: req.user.userId },
            {
                $push: {
                    reports: {
                        filename: req.file.filename,
                        description: req.body.description
                    }
                }
            },
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.status(200).json({ message: 'Report uploaded successfully', reports: patient.reports });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET - Get all reports
exports.getReports = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.status(200).json(patient.reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET - Get all prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.userId });
        if (!patient) {
            return res.status(404).json({ message: 'Patient profile not found' });
        }
        res.status(200).json(patient.prescriptions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};