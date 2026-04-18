import express from "express";
import {
  createOrUpdateProfile,
  getMyProfile,
  getDoctorByUserId,
  updateAvailability,
  getAvailability,
  getPendingDoctors,
  verifyDoctor,
  rejectDoctor,
  getAllDoctors,
  getDoctorsBySpecialization,
  searchDoctors,
  getDoctorById,
} from "../controllers/doctorController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/profile", protect, authorizeRoles("doctor"), createOrUpdateProfile);
router.get("/me", protect, authorizeRoles("doctor"), getMyProfile);


router.put("/availability", protect, authorizeRoles("doctor"), updateAvailability);
router.get("/availability/:userId", getAvailability);


router.get("/admin/pending", protect, authorizeRoles("admin"), getPendingDoctors);
router.put("/admin/verify/:id", protect, authorizeRoles("admin"), verifyDoctor);
router.put("/admin/reject/:id", protect, authorizeRoles("admin"), rejectDoctor);


router.get("/", getAllDoctors);
router.get("/specialization/:specialization", getDoctorsBySpecialization);
router.get("/search", searchDoctors);

router.get("/:userId", getDoctorByUserId);
router.get("/doc/:id", getDoctorById);

export default router;