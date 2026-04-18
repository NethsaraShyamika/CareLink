import Patient from '../models/Patient.js';

// GET - Get all patients (admin only)
export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}).select('-password');
        res.status(200).json(patients);
    } catch (err) {
        console.error('Error in getAllPatients:', err);
        res.status(500).json({ message: err.message });
    }
};

// GET - Get patient profile
export const getProfile = async (req, res) => {
    try {
        console.log('📋 Getting profile for userId:', req.user.userId || req.user.id);
        
        const userId = req.user.userId || req.user.id;
        const patient = await Patient.findOne({ userId });
        if (!patient) {
            return res.status(404).json({ 
                message: 'Patient profile not found',
                hint: 'Create a profile first using POST /api/patients/profile'
            });
        }
        res.status(200).json(patient);
    } catch (err) {
        console.error('Error in getProfile:', err);
        res.status(500).json({ message: err.message });
    }
};

// POST - Create patient profile
export const createProfile = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        console.log('📝 Creating profile for userId:', userId);
        
        const existing = await Patient.findOne({ userId });
        if (existing) {
            return res.status(400).json({ message: 'Profile already exists' });
        }

        const patient = new Patient({
            userId,
            firstName:      req.body.firstName,
            lastName:       req.body.lastName,
            email:          req.body.email,
            phone:          req.body.phone,
            dateOfBirth:    req.body.dateOfBirth,
            gender:         req.body.gender,
            address:        req.body.address,
            medicalHistory: req.body.medicalHistory,
            bloodType:      req.body.bloodType
        });

        const saved = await patient.save();
        console.log('✅ Profile created successfully');
        res.status(201).json({ message: 'Profile created successfully', patient: saved });
    } catch (err) {
        console.error('Error in createProfile:', err);
        res.status(500).json({ message: err.message });
    }
};

// PUT - Update patient profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const updated = await Patient.findOneAndUpdate(
            { userId },
            { $set: {
                firstName:      req.body.firstName,
                lastName:       req.body.lastName,
                email:          req.body.email,
                phone:          req.body.phone,
                dateOfBirth:    req.body.dateOfBirth,
                gender:         req.body.gender,
                address:        req.body.address,
                medicalHistory: req.body.medicalHistory,
                bloodType:      req.body.bloodType
            } },
            { returnDocument: 'after' }
        );

        if (!updated) return res.status(404).json({ message: 'Patient profile not found' });
        res.status(200).json({ message: 'Profile updated successfully', patient: updated });
    } catch (err) {
        console.error('Error in updateProfile:', err);
        res.status(500).json({ message: err.message });
    }
};

// POST - Upload medical report
export const uploadReport = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const userId = req.user.userId || req.user.id;
        const patient = await Patient.findOneAndUpdate(
            { userId },
            { $push: { reports: { filename: req.file.filename, description: req.body.description } } },
            { returnDocument: 'after' }
        );

        if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
        res.status(200).json({ message: 'Report uploaded successfully', reports: patient.reports });
    } catch (err) {
        console.error('Error in uploadReport:', err);
        res.status(500).json({ message: err.message });
    }
};

// GET - Get all reports
export const getReports = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const patient = await Patient.findOne({ userId });
        if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
        res.status(200).json(patient.reports);
    } catch (err) {
        console.error('Error in getReports:', err);
        res.status(500).json({ message: err.message });
    }
};

// GET - Get all prescriptions
export const getPrescriptions = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const patient = await Patient.findOne({ userId });
        if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
        res.status(200).json(patient.prescriptions);
    } catch (err) {
        console.error('Error in getPrescriptions:', err);
        res.status(500).json({ message: err.message });
    }
};