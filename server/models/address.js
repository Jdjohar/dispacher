const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: { type: String, required: false},
    address: { type: String, required: false},
    email: { type: String, required: false},
});
  
const Address = mongoose.model('Address', addressSchema);
  
module.exports = Address;