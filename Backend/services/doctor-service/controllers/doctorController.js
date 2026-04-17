import Doctor from "../models/doctor.js";


// ==============================
// 👤 PROFILE
// ==============================

// Create or Update Profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let doctor = await Doctor.findOne({ userId });

    if (doctor) {
      doctor = await Doctor.findOneAndUpdate(
        { userId },
        req.body,
        { returnDocument: 'after' }  // ✅ Use returnDocument instead of new
      );
      return res.json({ message: "Profile updated", doctor });
    }

    doctor = await Doctor.create({
      ...req.body,
      userId,
    });

    res.status(201).json({ message: "Profile created", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Profile
export const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor by User ID
export const getDoctorByUserId = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor by Document Id (Internal)
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ==============================
// 📅 AVAILABILITY
// ==============================

// Update Availability
export const updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      {
        workingDays: req.body.workingDays,
        availabilityStartTime: req.body.availabilityStartTime,
        availabilityEndTime: req.body.availabilityEndTime,
        slotMinutes: req.body.slotMinutes,
      },
      { returnDocument: 'after' }  // ✅ Change from { new: true } to { returnDocument: 'after' }
    );

    res.json({ message: "Availability updated", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Availability
export const getAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.params.userId });

    res.json({
      workingDays: doctor.workingDays,
      availabilityStartTime: doctor.availabilityStartTime,
      availabilityEndTime: doctor.availabilityEndTime,
      slotMinutes: doctor.slotMinutes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ==============================
// 🟢 ADMIN VERIFICATION
// ==============================

// Get pending doctors
export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: "pending" });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve doctor
export const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "approved",
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
      },
      { returnDocument: 'after' }  // ✅ Change from { new: true } to { returnDocument: 'after' }
    );

    res.json({ message: "Doctor approved", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject doctor
export const rejectDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "rejected",
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
      },
      { returnDocument: 'after' }  // ✅ Change from { new: true } to { returnDocument: 'after' }
    );

    res.json({ message: "Doctor rejected", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ==============================
// 🔍 SEARCH / LISTING
// ==============================

// Get all doctors (only approved)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: "approved" });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      specialization: req.params.specialization,
      verificationStatus: "approved",
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search doctors
export const searchDoctors = async (req, res) => {
  try {
    const { keyword, specialty } = req.query;

    let query = { verificationStatus: "approved" };

    if (keyword) {
      query.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { lastName: { $regex: keyword, $options: "i" } },
        { specialization: { $regex: keyword, $options: "i" } },
      ];
    }

    if (specialty) {
      query.specialization = new RegExp(specialty, "i");
    }

    const doctors = await Doctor.find(query);

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};