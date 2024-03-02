const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

router.post(
  '/',
  [
    check('username', 'Username required').not().isEmpty(),
    check('name', 'Name required').not().isEmpty(),
    check('phone', 'Invalid phone number').isMobilePhone(),
    check('email')
      .optional({ checkFalsy: true, nullable: true }) // Make email field optional
      .isEmail().withMessage('Invalid email'), // Check for valid email
    check('password', 'Minimum length of password is 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, name, email, phone, password } = req.body;

    try {
      // Check if user exists by email (if provided)
      // 
      if (email && email.length > 0) {
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ errors: [{ msg: 'User with this email already exists' }] });
        }
    }
      // Check if user exists
      let user = await User.findOne({ phone });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists choose different phone number' }] });
      }
      let userByUsername = await User.findOne({ username });

      if (userByUsername) {
        return res.status(400).json({ errors: [{ msg: 'User already exists choose different username' }] });
      }

      // Create a new User instance
      user = new User({
        username,
        name,
        phone,
        email,
        password,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Create and return JSON Web Token (JWT)
      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = await jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600000 });

      res.status(200).json({ token, id: user.id });
    } catch (err) {
      console.error(err);
      // console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
