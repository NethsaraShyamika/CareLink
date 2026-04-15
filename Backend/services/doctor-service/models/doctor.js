const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  availability: [
    {
      date: String,
      slots: [String], // example: ["10:00", "11:00"]
    },
  ],
});

module.exports = mongoose.model("Doctor", doctorSchema);