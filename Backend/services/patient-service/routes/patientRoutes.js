const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');

const {
    getProfile,
    createProfile,
    updateProfile,
    uploadReport,
    getReports,
    getPrescriptions
} = require('../controllers/patientController.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
        return cb(null, true);
    }
    cb(new Error('Only images, PDFs and documents allowed'));
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Profile routes
router.get('/profile',    verifyToken, getProfile);
router.post('/profile',   verifyToken, createProfile);
router.put('/profile',    verifyToken, updateProfile);

// Report routes
router.post('/upload-report', verifyToken, upload.single('report'), uploadReport);
router.get('/reports',        verifyToken, getReports);

// Prescription routes
router.get('/prescriptions', verifyToken, getPrescriptions);

module.exports = router;