const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  // 👤 Personal Info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },

  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\+?[\d\s\-()]{7,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },

  // 🔐 Auth Info
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[\w.-]+@[\w.-]+\.\w{2,}$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false   // never return password in queries by default
  },

  role: {
    type: String,
    enum: {
      values: ['patient', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'patient'
  },

  // 📋 Optional Profile Info
  dateOfBirth: {
    type: Date,
    default: null
  },

  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },

  // ✅ Account Status
  isActive: {
    type: Boolean,
    default: true
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // 🔁 Password Reset
  resetPasswordToken: {
    type: String,
    default: null
  },

  resetPasswordExpire: {
    type: Date,
    default: null
  },

  // 📧 Email Verification
  emailVerificationToken: {
    type: String,
    default: null
  },

  emailVerificationExpire: {
    type: Date,
    default: null
  }

}, { timestamps: true });
/*{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
}```*/