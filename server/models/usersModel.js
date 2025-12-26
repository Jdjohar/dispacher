const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    userType: {
      type: String,
      required: true,
      enum: ['dispatcher', 'container', 'admin'],
      default: 'container',
    },
    userMainId: {type: String, required: false},
});
  
const User = mongoose.model('User', userSchema);
  
module.exports = User;