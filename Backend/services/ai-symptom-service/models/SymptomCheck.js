// models/SymptomCheck.js
const mongoose = require("mongoose");

const symptomCheckSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", 
      required: true,
    },
    symptoms: {
      type: [String],
      required: true,
    },
    additionalNotes: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    aiResponse: {
      type: {
        possibleConditions: [
          {
            name: String,
            description: String,
            severity: {
              type: String,
              enum: ["low", "moderate", "high"],
            },
          },
        ],
        recommendedSpecialties: [String],
        urgencyLevel: {
          type: String,
          enum: ["routine", "soon", "urgent", "emergency"],
        },
        generalAdvice: String,
        disclaimer: String,
      },
      default: () => ({
        possibleConditions: [],
        recommendedSpecialties: [],
        urgencyLevel: "routine",
        generalAdvice: "",
        disclaimer: "",
      }),
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

symptomCheckSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model("SymptomCheck", symptomCheckSchema);