const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema(
  {
    jobNumber: {type: String, unique: true, required: true, trim: true,},
    uplift: String,
    offload: String,
    jobStart: Date,
    size: String,
    release: String,
    random: String,
    slot: String,
    pin: String,
    doors: String,
    dg: Boolean,
    weight: String,
    commodityCode: String,
    instructions: String,
    containerNumber: String,

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    status: [
      {
        stage: {
          type: String,
          enum: ['accept', 'uplift', 'offload', 'done'],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

  
const Job = mongoose.model('Job', jobSchema);
  
module.exports = Job;