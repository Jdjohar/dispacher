const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ['dispatcher', 'container', 'admin'],
      default: 'container',
    },
    userMainId: { type: String, index: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

  
const User = mongoose.model('User', userSchema);
  
module.exports = User;