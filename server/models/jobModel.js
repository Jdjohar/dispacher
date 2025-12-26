const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  uplift: { type: String, required: false },
  offload: { type: String, required: false },
  jobStart: { type: String, required: false },
  size: { type: String, required: false },
  release: { type: String, required: false },
  slot: { type: String, required: false },
  pin: { type: String, required: false },
  random: { type: String, required: false },
  doors:{ type: String, required: false },
  dg:{type: String, required: false},
  weight:{type: String, required: false},
  commodityCode: { type: String, required: false },
  instructions: { type: String, required: false },
  containerNumber: { type: String, required: false },
  userMainId: {type: String, required: false},
  complete: { type: String, required: false },
  status: [
    {
      type: {
        type: String,
        required: false,
        enum: ['accept', 'uplift', 'offload', 'done'],
        default:'accept',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});
  
const Job = mongoose.model('Job', jobSchema);
  
module.exports = Job;