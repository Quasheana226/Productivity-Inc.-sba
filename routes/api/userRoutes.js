const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { signToken } = require('../../utils/auth');


// POST /api/users/register
// Creates a new user account.
// The plain password is passed directly to User.create() —
// the pre-save hook in User.js hashes it automatically before it hits the DB.
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    // Reject duplicate emails before hitting the DB unique constraint
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    // Pre-save hook fires here and hashes the password before saving
    const newUser = await User.create({
      username,
      email: email.toLowerCase().trim(),
      password,
    });

    return res.status(201).json({
      message: 'User registered successfully. Please log in.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});


// POST /api/users/login
// Validates credentials and returns a signed JWT.
// Both "user not found" and "wrong password" return the same 401 message
// to prevent email enumeration attacks.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // bcrypt.compare extracts the salt from the stored hash automatically
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});


module.exports = router;
