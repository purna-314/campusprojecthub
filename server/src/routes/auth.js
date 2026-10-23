import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
  console.warn('\x1b[33m⚠ WARNING: JWT_SECRET is not set. Using insecure default for development only.\x1b[0m');
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'campus_project_hub_dev_only_secret_do_not_use_in_prod';

// Helper to strip sensitive fields from user object
function sanitizeUser(user) {
  if (!user) return null;
  const safe = { ...user };
  delete safe.password;
  delete safe.verificationCode;
  delete safe.verificationToken;
  delete safe.resetPasswordCode;
  delete safe.resetPasswordExpires;
  return safe;
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and dispatch email verification
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'student', 
      rollNo = '', 
      year = 1, 
      batchId = '', 
      department = 'Computer Science & Engineering',
      designation = ''
    } = req.body;

    // Basic Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await db.getUserByEmail(normalizedEmail);

    // 6-digit OTP code and secure verification token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // If user already exists
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({ 
          error: 'An account with this email address already exists. Please sign in.' 
        });
      }

      // Existing unverified account: update credentials and resend verification
      const hashedPassword = await bcrypt.hash(password, 10);
      const updated = await db.updateUser(existingUser.id, {
        name: name.trim(),
        password: hashedPassword,
        role,
        rollNo: rollNo.trim(),
        year: Number(year) || 1,
        batchId,
        department,
        designation,
        verificationCode,
        verificationToken,
        verificationExpires: verificationExpires.toISOString()
      });

      const emailResult = await sendVerificationEmail({
        to: normalizedEmail,
        name: name.trim(),
        code: verificationCode,
        token: verificationToken,
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
      });

      const response = {
        message: 'Account exists but was unverified. A fresh 6-digit verification code has been dispatched to your email.',
        email: normalizedEmail,
        requiresVerification: true
      };
      if (!IS_PRODUCTION) {
        response.devCode = emailResult.devCode || verificationCode;
        response.previewUrl = emailResult.previewUrl || null;
      }
      return res.status(200).json(response);
    }

    // New User Registration
    const hashedPassword = await bcrypt.hash(password, 10);
    const yearNum = Number(year) || 1;
    const yearLabel = `${yearNum}${yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th'} Year`;

    const newUser = await db.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      rollNo: rollNo.trim(),
      year: yearNum,
      yearLabel,
      batchId,
      department,
      designation: designation || (role === 'student' ? `${yearLabel} Student` : 'Faculty Guide'),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563eb,4f46e5,0891b2`,
      isVerified: false,
      verificationCode,
      verificationToken,
      verificationExpires: verificationExpires.toISOString()
    });

    // Send verification email
    const emailResult = await sendVerificationEmail({
      to: normalizedEmail,
      name: newUser.name,
      code: verificationCode,
      token: verificationToken,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    });

    const response = {
      message: 'Account successfully registered! Please enter the 6-digit verification code sent to your email.',
      email: normalizedEmail,
      requiresVerification: true
    };
    if (!IS_PRODUCTION) {
      response.devCode = emailResult.devCode || verificationCode;
      response.previewUrl = emailResult.previewUrl || null;
    }
    res.status(201).json(response);
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: IS_PRODUCTION ? 'Server error during registration' : 'Server error during registration: ' + err.message });
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address using 6-digit code or token
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code, token } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    if (!code && !token) {
      return res.status(400).json({ error: 'Verification code or token is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(404).json({ error: 'No user account found with this email' });
    }

    if (user.isVerified) {
      // Already verified, generate session token
      const authToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        EFFECTIVE_JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        message: 'Email is already verified. You are signed in!',
        token: authToken,
        user: sanitizeUser(user)
      });
    }

    // Check expiration
    if (user.verificationExpires && new Date() > new Date(user.verificationExpires)) {
      return res.status(400).json({ 
        error: 'Verification code has expired. Please request a new verification code.',
        expired: true 
      });
    }

    // Verify code or token
    const isCodeMatch = code && String(user.verificationCode).trim() === String(code).trim();
    const isTokenMatch = token && user.verificationToken === token;

    if (!isCodeMatch && !isTokenMatch) {
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    // Mark user as verified
    const updatedUser = await db.updateUser(user.id, {
      isVerified: true,
      verificationCode: null,
      verificationToken: null,
      verificationExpires: null
    });

    // Generate JWT auth token
    const authToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      EFFECTIVE_JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Email verified successfully! Welcome to Campus Project Hub.',
      token: authToken,
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('Error during email verification:', err);
    res.status(500).json({ error: IS_PRODUCTION ? 'Server error during verification' : 'Server error during verification: ' + err.message });
  }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend a new 6-digit verification code to the email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'This email is already verified. You can sign in directly.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.updateUser(user.id, {
      verificationCode,
      verificationToken,
      verificationExpires: verificationExpires.toISOString()
    });

    const emailResult = await sendVerificationEmail({
      to: normalizedEmail,
      name: user.name,
      code: verificationCode,
      token: verificationToken,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    });

    const response = {
      message: 'A fresh verification code has been dispatched to your email.',
      email: normalizedEmail,
    };
    if (!IS_PRODUCTION) {
      response.devCode = emailResult.devCode || verificationCode;
      response.previewUrl = emailResult.previewUrl || null;
    }
    res.json(response);
  } catch (err) {
    console.error('Error resending verification code:', err);
    res.status(500).json({ error: 'Server error resending code: ' + err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Sign in with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if Email is Verified
    if (!user.isVerified) {
      // Generate and send a fresh code if none exists or expired
      let code = user.verificationCode;
      let previewUrl = null;
      if (!code || (user.verificationExpires && new Date() > new Date(user.verificationExpires))) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        await db.updateUser(user.id, {
          verificationCode: code,
          verificationExpires: verificationExpires.toISOString()
        });
        const result = await sendVerificationEmail({
          to: normalizedEmail,
          name: user.name,
          code,
          clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
        });
        previewUrl = result.previewUrl || null;
      }

      const unverifiedResponse = {
        error: 'Your email address is not yet verified. Please verify your email to access the portal.',
        unverified: true,
        email: user.email,
      };
      if (!IS_PRODUCTION) {
        unverifiedResponse.devCode = code;
        unverifiedResponse.previewUrl = previewUrl;
      }
      return res.status(403).json(unverifiedResponse);
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      EFFECTIVE_JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Sign in successful!',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error during sign in: ' + err.message });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({
      user: sanitizeUser(req.user)
    });
  } catch (err) {
    console.error('Error fetching /me:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset OTP
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.getUserByEmail(normalizedEmail);

    if (user) {
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

      await db.updateUser(user.id, {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires.toISOString()
      });

      const emailResult = await sendPasswordResetEmail({
        to: normalizedEmail,
        name: user.name,
        code: resetCode,
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
      });

      const response = {
        message: 'If an account matches that email, a password reset code has been sent.',
      };
      if (!IS_PRODUCTION) {
        response.devCode = emailResult.devCode || resetCode;
        response.previewUrl = emailResult.previewUrl || null;
      }
      return res.json(response);
    }

    // Always return benign message to prevent email enumeration
    res.json({
      message: 'If an account matches that email, a password reset code has been sent.'
    });
  } catch (err) {
    console.error('Error during forgot-password:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset OTP
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(400).json({ error: 'Invalid password reset request' });
    }

    if (!user.resetPasswordCode || String(user.resetPasswordCode).trim() !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid or expired password reset code' });
    }

    if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ error: 'Password reset code has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null
    });

    res.json({
      message: 'Password successfully reset! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Error during reset-password:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default router;
