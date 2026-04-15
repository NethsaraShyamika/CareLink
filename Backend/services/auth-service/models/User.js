import mongoose from 'mongoose';

// ─── Counter Schema (for auto-incrementing userId) ────────────────────────────

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },   // e.g. "userId"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

// ─── User Schema ───────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // 🪪 Auto-incrementing human-readable ID
    userId: {
      type: Number,
      unique: true,
    },

    // 👤 Identity Info
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    // 📞 Contact
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
    },

    // 🔐 Login Identity
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // 🔒 never return password
    },

    // 🧭 System Role
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
    },

    // ✅ Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // 🔁 Token management
    refreshToken: {
      type: String,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    // 🔢 OTP fields
    resetOtp: {
      type: String,
      default: null,
    },

    resetOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Auto-increment userId before saving ──────────────────────────────────────

userSchema.pre('save', async function (next) {
  if (!this.isNew) return next(); // only run on new documents

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Export ────────────────────────────────────────────────────────────────────

const User = mongoose.model('User', userSchema);
export default User;
/*{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
}```*/