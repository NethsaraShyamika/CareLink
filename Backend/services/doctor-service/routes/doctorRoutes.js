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
} from "../controllers/doctorController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👤 Profile
router.post("/profile", protect, authorizeRoles("doctor"), createOrUpdateProfile);
router.get("/me", protect, authorizeRoles("doctor"), getMyProfile);

// 📅 Availability
router.put("/availability", protect, authorizeRoles("doctor"), updateAvailability);
router.get("/availability/:userId", getAvailability);

// 🟢 Admin verification
router.get("/admin/pending", protect, authorizeRoles("admin"), getPendingDoctors);
router.put("/admin/verify/:id", protect, authorizeRoles("admin"), verifyDoctor);
router.put("/admin/reject/:id", protect, authorizeRoles("admin"), rejectDoctor);

// 🔍 Search
router.get("/", getAllDoctors);
router.get("/specialization/:specialization", getDoctorsBySpecialization);
router.get("/search", searchDoctors);

router.get("/:userId", getDoctorByUserId);

export default router;