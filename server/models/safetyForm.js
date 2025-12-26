const mongoose = require('mongoose');

const SafetyFormSchema = new mongoose.Schema({
    firstName: String,
    surname: String,
    addressSite: String,
    jobNumber: { type: String, default: '' }, 
    fitForDuty: String,
    mealBreak: String,
    PPE: String,
    message: { type: String, default: '' }, 
  });
  
  
const SafetyForm = mongoose.model('SafetyForm', SafetyFormSchema);
  
module.exports = SafetyForm;