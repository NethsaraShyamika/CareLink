const Doctor = require("../models/doctor");

// Create Doctor Profile
exports.createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Availability
exports.updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    doctor.availability = req.body.availability;
    await doctor.save();
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};