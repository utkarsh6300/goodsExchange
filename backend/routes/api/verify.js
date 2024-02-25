const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const twilio = require('twilio');
const accountSid = process.env.YOUR_ACCOUNT_SID;
const authToken =  process.env.YOUR_AUTH_TOKEN;
const twilioPhoneNumber =  process.env.YOUR_TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);


const User = require('../../models/User');
const generateRandomCode = require('../../utils/generateRandomCode');

// Endpoint to send verification code to a user's phone
router.post(
  '/send-verification-code',
  [
    check('phone', 'Invalid phone number').isMobilePhone(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { phone } = req.body;

    try {
      // Check if user exists by phone number
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'User not found' }] });
      }

      // Generate and send verification code to the user's phone
      const verificationCode = generateRandomCode.generateOTP();
      // use an SMS service to send the code to the user's phone here

      await client.messages.create({
        body: `Your verification code for Goods-Exchange is: ${verificationCode}`,
        from: twilioPhoneNumber,
        to: `+91${phone}` // Assuming the 'phone' field is the user's phone number
      });

      // console.log(verificationCode);  
      // Store the verification code and its expiration in the user's document
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // Code expires in 15 minutes
      await user.save();

      res.status(200).json({ msg: 'Verification code sent successfully' });
    } catch (err) {
      console.error(err);
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Endpoint to verify the received code
router.post(
  '/verify-code',
  [
    check('phone', 'Invalid phone number').isMobilePhone(),
    check('code', 'Verification code is six digit number').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, code } = req.body;

    try {
      // Check if user exists by phone number
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'User not found' }] });
      }

      // Check if the received code matches and is still valid
      if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
        return res.status(400).json({ errors: [{ msg: 'Invalid verification code' }] });
      }

      // Mark the user as verified
      user.isVerified = true;
      await user.save();

      res.json({ msg: 'Phone number verified successfully' });
    } catch (err) {
      console.error(err);
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
