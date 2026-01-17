const mongoose = require('mongoose');

const SafetyFormSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: String,
    surname: String,
    addressSite: String,
    fitForDuty: String,
    mealBreak: String,
    PPE: String,
    message: String,
  },
  { timestamps: true }
);

  
  
const SafetyForm = mongoose.model('SafetyForm', SafetyFormSchema);
  
module.exports = SafetyForm;