const mongoose = require('mongoose');

const UserAccessSchema = new mongoose.Schema({
  accessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  accessedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  accessTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserAccess', UserAccessSchema);
