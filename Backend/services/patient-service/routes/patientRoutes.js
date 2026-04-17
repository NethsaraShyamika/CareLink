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
    getPrescriptions,
    getAllPatients
} from '../controllers/patientController.js';

const router = express.Router();

// ─── Local admin check (no cross-service import needed) ───────────────────────
const requireAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename:    (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    allowed.test(path.extname(file.originalname).toLowerCase())
        ? cb(null, true)
        : cb(new Error('Only images, PDFs and documents allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Profile routes
router.get('/profile',            verifyToken,              getProfile);
router.post('/profile',           verifyToken,              createProfile);
router.put('/profile',            verifyToken,              updateProfile);

// Report routes
router.post('/upload-report',     verifyToken, upload.single('report'), uploadReport);
router.get('/reports',            verifyToken,              getReports);

// Prescription routes
router.get('/prescriptions',      verifyToken,              getPrescriptions);

// ✅ Admin: get all patients — GET not POST
router.get('/all',                verifyToken, requireAdmin, getAllPatients);

export default router;