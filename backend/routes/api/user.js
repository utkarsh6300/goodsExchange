const express = require('express');
const router = express.Router();

const User = require('../../models/User');
const authMiddleware = require('../../middlewares/authMiddleware');
// const  mongoose  = require('mongoose');

const UserAccess = require('../../models/UserAccess');

// Endpoint to get a user's phone number by ID
router.get('/get-number/:userId', authMiddleware,async (req, res) => {
  const userId = req.params.userId;

  try {



    // Find the user by ID
    const phoneNumber = await User.findById(userId).select('phone');
   // add feature to add access list who accesed whom number.

    // Create a new UserAccess record
    const userAccess = new UserAccess({
      accessedBy: req.user.id, // The user who accessed
      accessedUser: userId, // The user whose information was accessed
    });

    await userAccess.save();
    
    if (!phoneNumber) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ phoneNumber:phoneNumber.phone });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
