const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, lowercase: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
  );
  
  
const Address = mongoose.model('Address', addressSchema);
  
module.exports = Address;