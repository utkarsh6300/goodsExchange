const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { oneOf, check, validationResult } = require('express-validator');
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post(
  '/',
  [
    oneOf([
      check('phone', 'Invalid phone number').exists().isMobilePhone(),
      check('username', 'Username required').exists().not().isEmpty(),
    ]),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, phone, password } = req.body;

    try {
      let user;

      // Check if user exists based on phone or username
      if (phone) {
        user = await User.findOne({ phone });
      } else {
        user = await User.findOne({ username });
      }

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'User does not exist' }] });
      }
      else if(!user.isVerified){
        return res.status(401).json({ errors: [{ msg: 'Users phone is not verified' }] });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Incorrect password' }] });
      }

      // Create JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = await jwt.sign(payload, process.env.jwtSecret || config.get('jwtSecret'), { expiresIn: 3600000 });

      res.status(200).json({ token, id: user.id });
    } catch (err) {
      console.error(err);
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
