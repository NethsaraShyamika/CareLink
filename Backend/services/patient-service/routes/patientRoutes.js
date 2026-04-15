import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import multer from 'multer';
import path from 'path';
import {
    getProfile,
    createProfile,
    updateProfile,
    uploadReport,
    getReports,
    getPrescriptions
} from '../controllers/patientController.js';

const router = express.Router();

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

export default router;