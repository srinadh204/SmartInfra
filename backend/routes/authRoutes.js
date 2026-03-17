const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const profileUploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Configure multer for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

const otps = new Map(); // Store OTPs in memory { email: otp }

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_smart_infra';

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, role, adminSecret } = req.body;

    // Validation
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    if (role === 'Admin') {
      const EXPECTED_ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'smartinfra_admin_2024';
      if (adminSecret !== EXPECTED_ADMIN_KEY) {
        return res.status(400).json({ message: 'Invalid Admin Unique Key' });
      }
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: role || 'Citizen'
    });

    const savedUser = await newUser.save();

    // Sign the token to automatically login
    const payload = {
      id: savedUser._id,
      role: savedUser.role
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: 3600 * 24 }, // 24 hours
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role
          }
        });
      }
    );

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, adminSecret } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (role === 'Admin') {
      const EXPECTED_ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'smartinfra_admin_2024';
      if (adminSecret !== EXPECTED_ADMIN_KEY) {
        return res.status(400).json({ message: 'Invalid Admin Unique Key' });
      }
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Sign the token
    const payload = {
      id: user._id,
      role: user.role
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: 3600 * 24 }, // 24 hours
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, mobile, email } = req.body;
    let updateFields = {};
    if (name) updateFields.name = name;
    if (mobile) updateFields.mobile = mobile;
    if (email) updateFields.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/profile-picture
// @desc    Upload or update user profile picture
router.post('/profile-picture', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    // The file url relative path to be saved in DB
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePicture: imageUrl } },
      { new: true }
    ).select('-password');

    res.json({ msg: 'Profile picture updated', user });
  } catch (err) {
    console.error('--- UPLOAD ERROR LOG ---');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    if (req.file) console.error('File info:', req.file);
    console.error('------------------------');
    res.status(500).json({ msg: 'Server Error during upload', details: err.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP via email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email address' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User with this email not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(email, otp);

    // Email transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "srinadhpolaveni6@gmail.com",
        pass: "vxxv uofp esna fqjd"
      }
    });

    let mailOptions = {
      from: '"Smart Infra Support" <srinadhpolaveni6@gmail.com>',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: 'Error sending OTP email' });
      }
      res.status(200).json({ message: `OTP has been successfully sent to ${email}` });
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// @route   POST /api/auth/verify-otp-reset-password
// @desc    Verify OTP and reset password
router.post('/verify-otp-reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    const storedOtp = otps.get(email);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Clear OTP
    otps.delete(email);

    res.status(200).json({ message: 'Password has been successfully reset. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @route   POST /api/auth/send-email-otp
// @desc    Send OTP to email for registration verification
const registrationOtps = new Map(); // { email: { otp, expiresAt } }

router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists. Please login instead.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    registrationOtps.set(email, { otp, expiresAt });

    // Send via nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'srinadhpolaveni6@gmail.com',
        pass: 'vxxv uofp esna fqjd'
      }
    });

    const mailOptions = {
      from: '"Smart Infra" <srinadhpolaveni6@gmail.com>',
      to: email,
      subject: 'Email Verification OTP – Smart Infra',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e2e8f0;">
          <h2 style="color:#0f172a;margin-bottom:8px;">Verify your email</h2>
          <p style="color:#475569;margin-bottom:24px;">Use the OTP below to complete your Smart Infra registration. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;font-size:2rem;font-weight:800;letter-spacing:0.3em;color:#0f172a;">${otp}</div>
          <p style="color:#94a3b8;font-size:0.85rem;margin-top:20px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
      }
      res.status(200).json({ message: `OTP sent to ${email}` });
    });

  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// @route   POST /api/auth/verify-email-otp
// @desc    Verify OTP for registration email
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = registrationOtps.get(email);

    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this email. Please request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      registrationOtps.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }

    // OTP verified — remove it
    registrationOtps.delete(email);
    res.status(200).json({ message: 'Email verified successfully.' });

  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;

