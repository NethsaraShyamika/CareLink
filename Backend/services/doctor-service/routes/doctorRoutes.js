const express = require("express");
const router = express.Router();
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateAvailability,
} = require("../controllers/doctorController");

// Routes
router.post("/", createDoctor);
router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.put("/:id/availability", updateAvailability);

module.exports = router;