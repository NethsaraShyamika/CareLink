import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendWelcomeEmail, sendOtpEmail, sendPasswordResetSuccessEmail, sendEmail } from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'icomputers';

// ─── Register / Create User ────────────────────────────────────────────────────

export async function createUser(req, res) {
  const data = req.body;
  try {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = new User({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: passwordHash,
      phone: data.phone,
      role: data.role || 'patient',
    });

    await newUser.save();

    // Email sending temporarily disabled for development
    // try {
    //   await sendWelcomeEmail(data.email, data.firstName);
    // } catch (emailError) {
    //   console.log('Welcome email sending failed:', emailError.message);
    // }

    const payload = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      isActive: newUser.isActive,
      isEmailVerified: newUser.isEmailVerified,
      phone: newUser.phone,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '48h' });

    req.session.user = payload;
    req.session.save((err) => {
      if (err) console.log('Session save error:', err);
    });

    res.status(201).json({ message: 'User created successfully', token, user: payload });
  } catch (error) {
    console.log('Error in createUser:', error);
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (error.keyPattern?.phone) {
        return res.status(400).json({ message: 'Phone already registered' });
      }
      return res.status(400).json({ message: 'A duplicate record was found. Please try again.' });
    }
    res.status(403).json({ message: 'Error creating user' });
  }
}

// ─── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // No isBlocked field in new model

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      phone: user.phone,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '48h' });

    req.session.user = payload;
    req.session.save((err) => {
      if (err) console.log('Session save error:', err);
    });

    return res.json({ message: 'Login successful', token, role: user.role, userId: user._id });
  } catch (error) {
    console.log('Error in loginUser:', error);
    res.status(500).json({ message: 'Error logging in user' });
  }
}

// ─── Logout ────────────────────────────────────────────────────────────────────

export async function logoutUser(req, res) {
  try {
    req.session.destroy((error) => {
      if (error) return res.status(500).json({ message: 'Error logging out' });
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out' });
  }
}

// ─── Profile ───────────────────────────────────────────────────────────────────

export async function getMyProfile(req, res) {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated – user ID missing' });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated – user ID missing' });
    }

    // No isAdmin or isBlocked fields in new model

    const { email, firstName, lastName, password, phone } = req.body;
    const updateData = {};

    if (email)       updateData.email       = email;
    if (firstName)   updateData.firstName   = firstName;
    if (lastName)    updateData.lastName    = lastName;
    if (phone)       updateData.phone       = phone;

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    const newToken = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        isEmailVerified: updatedUser.isEmailVerified,
        phone: updatedUser.phone,
      },
      JWT_SECRET,
      { expiresIn: '48h' }
    );

    if (req.session?.user) {
      req.session.user = {
        ...req.session.user,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        id: updatedUser.id,
        phone: updatedUser.phone,
      };
      req.session.save((err) => {
        if (err) console.error('Session update error:', err);
      });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser, token: newToken });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
}

export async function deleteOwnAccount(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findByIdAndDelete(req.user.id || req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.session.destroy((error) => {
      if (error) console.log('Session destroy error:', error);
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error deleting account' });
  }
}

// ─── Password Reset (OTP flow) ─────────────────────────────────────────────────

export async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // OTP-based flow
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Token-based flow (hashed, for link reset)
    const rawToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Email sending temporarily disabled for development
    // try {
    //   await sendOtpEmail(user.email, user.firstName, otp);
    // } catch (emailError) {
    //   console.log('OTP email failed, falling back to generic sendEmail:', emailError.message);
    //   const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
    //   await sendEmail({
    //     to: user.email,
    //     subject: 'Password Reset',
    //     html: `
    //       <p>Hi ${user.firstName || user.name},</p>
    //       <p>Your OTP is <strong>${otp}</strong> (expires in 10 min) or click the link below:</p>
    //       <a href="${resetUrl}" style="padding:10px 20px;background:#e63757;color:#fff;border-radius:5px;text-decoration:none">
    //         Reset Password
    //       </a>
    //     `,
    //   });
    // }

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.password        = await bcrypt.hash(newPassword, 10);
    user.resetOtp        = null;
    user.resetOtpExpiry  = null;
    // Also clear token-based fields if set
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpire  = undefined;
    await user.save();

    // Email sending temporarily disabled for development
    // try {
    //   await sendPasswordResetSuccessEmail(user.email, user.firstName);
    // } catch (emailError) {
    //   console.log('Reset success email failed:', emailError.message);
    // }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}

// ─── Password Reset (token/link flow) ─────────────────────────────────────────

export async function resetPasswordByToken(req, res) {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password            = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    user.resetOtp            = null;
    user.resetOtpExpiry      = null;
    await user.save();

    // Email sending temporarily disabled for development
    // try {
    //   await sendPasswordResetSuccessEmail(user.email, user.firstName);
    // } catch (emailError) {
    //   console.log('Reset success email failed:', emailError.message);
    // }

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

// ─── Search ────────────────────────────────────────────────────────────────────

export async function searchUser(req, res) {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Please provide a search query' });

    const users = await User.find({
      $or: [
        { email:     { $regex: `^${query}`, $options: 'i' } },
        { firstName: { $regex: `^${query}`, $options: 'i' } },
        { lastName:  { $regex: `^${query}`, $options: 'i' } },
        { phone:     { $regex: `^${query}`, $options: 'i' } },
      ],
    }).select('-password');

    if (users.length === 0) return res.status(404).json({ message: 'No users found' });

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error searching user' });
  }
}

// ─── Admin Actions ─────────────────────────────────────────────────────────────

export async function blockUser(req, res) {
  try {
    // No blockUser functionality in new model
    return res.status(501).json({ message: 'Blocking users is not supported in the current model.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error blocking user' });
  }
}

export async function unblockUser(req, res) {
  try {
    // No unblockUser functionality in new model
    return res.status(501).json({ message: 'Unblocking users is not supported in the current model.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error unblocking user' });
  }
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export function isAdmin(req, res, next) {
  // No isAdmin field in new model
  return res.status(501).json({ message: 'Admin check is not supported in the current model.' });
}