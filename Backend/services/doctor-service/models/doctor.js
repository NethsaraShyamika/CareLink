import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

   
    workingDays: {
      type: [String],
      enum: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
      default: ["MON", "TUE", "WED", "THU", "FRI"],
    },

    availabilityStartTime: {
      type: String,
      default: "08:00",
    },

    availabilityEndTime: {
      type: String,
      default: "18:00",
    },

    slotMinutes: {
      type: Number,
      default: 30,
      min: 5,
    },

    hospitalOrClinic: {
      type: String,
      default: "Online",
    },

   
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId, 
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Doctor", doctorSchema);