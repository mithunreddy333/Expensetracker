const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', auth, async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    };
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Create reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Link',
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // Verify connection configuration
    await transporter.verify();
    
    try {
      // Log the configuration (without sensitive data)
      console.log('Attempting to send email to:', user.email);
      
      // Test SMTP connection
      try {
        await transporter.verify();
        console.log('SMTP connection successful');
      } catch (verifyError) {
        console.error('SMTP Verification Error:', verifyError);
        throw new Error('Failed to connect to email server: ' + verifyError.message);
      }
      
      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      console.log('Message ID:', info.messageId);
      res.json({ message: 'Password reset email sent' });
    } catch (emailError) {
      console.error('Detailed email error:', {
        name: emailError.name,
        message: emailError.message,
        code: emailError.code,
        command: emailError.command
      });
      throw emailError;
    }
  } catch (err) {
    console.error('Error in forgot password:', err);
    if (err.code === 'EAUTH') {
      res.status(500).json({ 
        message: 'Email authentication failed. Please check your email credentials.',
        details: err.message
      });
    } else if (err.code === 'ESOCKET') {
      res.status(500).json({ 
        message: 'Network error while sending email. Please check your internet connection.',
        details: err.message
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send reset email',
        details: err.message
      });
    }
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    console.error('Error in reset password:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

module.exports = router;
