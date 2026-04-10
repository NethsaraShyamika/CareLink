const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    /*password: {
        type: String,
        required: true
    },*/
    phone: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    medicalHistory: {
        type: String,
        required: false
    },
    bloodType: {
        type: String,
        required: false
    },
    reports: [
        {
            filename: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: false
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    prescriptions: [
        {
            doctorId: {
                type: String,
                required: true
            },
            doctorName: {
                type: String,
                required: true
            },
            details: {
                type: String,
                required: true
            },
            issuedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);