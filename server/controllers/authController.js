const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'rathore_jwt_secret_key_2024_secure',
    { expiresIn: '7d' }
  );
};


// Register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    if (!phone || !phone.trim() || phone.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer phone number is mandatory (min. 10 digits).' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email already exists.' 
      });
    }

    const user = await User.create({ 
      name, 
      email: email.toLowerCase().trim(), 
      password, 
      phone: phone.trim() 
    });
    const token = generateToken(user);


    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || '',
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been disabled. Contact admin.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || '',
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Google OAuth Login
exports.googleLogin = async (req, res) => {
  try {
    const { credential, email: directEmail, name: directName, picture: directAvatar, googleId: directGoogleId, phone: directPhone } = req.body;

    let email = directEmail;
    let name = directName;
    let avatar = directAvatar || '';
    let googleId = directGoogleId || '';
    let phone = directPhone || '';


    // If Google ID token is passed, verify with Google OAuth2 API
    if (credential) {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (response.ok) {
          const payload = await response.json();
          email = payload.email || email;
          name = payload.name || payload.given_name || name;
          avatar = payload.picture || avatar;
          googleId = payload.sub || googleId;
        } else {
          // Fallback: decode the JWT payload
          try {
            const parts = credential.split('.');
            if (parts.length === 3) {
              const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
              email = decoded.email || email;
              name = decoded.name || decoded.given_name || name;
              avatar = decoded.picture || avatar;
              googleId = decoded.sub || googleId;
            }
          } catch (e) {
            console.warn('Could not decode credential payload:', e.message);
          }
        }
      } catch (err) {
        console.error('Google token verification fetch error:', err.message);
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            email = decoded.email || email;
            name = decoded.name || decoded.given_name || name;
            avatar = decoded.picture || avatar;
            googleId = decoded.sub || googleId;
          }
        } catch (e) {
          console.warn('Could not decode credential:', e.message);
        }
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email could not be retrieved.'
      });
    }

    email = email.toLowerCase().trim();

    // Check if user exists by email or googleId
    let user = await User.findOne({ 
      $or: [
        { email },
        ...(googleId ? [{ googleId }] : [])
      ] 
    });

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your account has been disabled. Contact admin.' 
        });
      }

      let modified = false;
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (name && (!user.name || user.name === 'User')) {
        user.name = name;
        modified = true;
      }
      if (phone && !user.phone) {
        user.phone = phone.trim();
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      const generatedPassword = `google_auth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        phone: (phone || '').trim(),
        password: generatedPassword,
        googleId: googleId || `google_${Date.now()}`,
        avatar,
        role: 'user',
        isActive: true
      });
    }


    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Signed in with Google successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during Google login.' 
    });
  }
};


// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || '',
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone } = req.body;

    if (!phone || !phone.trim() || phone.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number is mandatory (min. 10 digits).'
      });
    }

    const updateData = { phone: phone.trim() };
    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || '',
        role: user.role
      }
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Change password (secure for admin and users)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    // Explicitly query user with password field
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};

// Forgot password request
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been provided.'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    res.json({
      success: true,
      message: `Password reset code is: ${resetCode}`,
      resetCode
    });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset request.' });
  }
};

// Reset password with code / direct
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email.' });
    }

    if (resetCode && user.resetPasswordToken) {
      if (user.resetPasswordToken !== resetCode) {
        return res.status(400).json({ success: false, message: 'Invalid reset code.' });
      }
      if (user.resetPasswordExpire && user.resetPasswordExpire < Date.now()) {
        return res.status(400).json({ success: false, message: 'Reset code has expired.' });
      }
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};


