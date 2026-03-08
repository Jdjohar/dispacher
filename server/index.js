/************************************************
 * LOAD ENV
 ************************************************/
require('dotenv').config();
const uploadRoutes = require("./upload.js");
/************************************************
 * IMPORTS
 ************************************************/
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

/************************************************
 * MODELS
 ************************************************/
const User = require('./models/usersModel.js');
const Address = require('./models/address');
const Job = require('./models/jobModel');
const SafetyForm = require('./models/safetyForm');
const crypto = require("crypto");
/************************************************
 * APP INIT
 ************************************************/
const app = express();
const PORT = process.env.PORT || 10000;

/************************************************
 * MIDDLEWARE
 ************************************************/
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://dispacher-5dsn.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

/************************************************
 * DATABASE
 ************************************************/
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB error', err);
    process.exit(1);
  });

app.use("/api/upload", uploadRoutes);

/************************************************
 * AUTH MIDDLEWARE
 ************************************************/
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    req.user = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const role = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.userType)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

/************************************************
 * HEALTH
 ************************************************/
app.get('/', (req, res) => {
  res.send('Backend running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

/************************************************
 * EMAIL HELPER
 ************************************************/
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendCompletionEmail = async (userEmail, jobNumber, customer) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials missing, skipping email");
    return;
  }

  const mailOptions = {
    from: `"Malwa Transport" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Job Completed - ${jobNumber}`,
    html: `
      <h2>Job Confirmation</h2>
      <p>Hello,</p>
      <p>This is to confirm that the job <strong>${jobNumber}</strong> for <strong>${customer}</strong> has been successfully completed.</p>
      <p>Thank you for choosing Malwa Transport.</p>
      <br/>
      <p>Best Regards,</p>
      <p>The Malwa Transport Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}`);
  } catch (error) {
    console.error("Email send error:", error);
  }
};

/************************************************
 * AUTH ROUTES
 ************************************************/
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  const token = jwt.sign(
    { userId: user._id, userType: user.userType },
    process.env.SECRET_KEY,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      userId: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
      userMainId: user.userMainId || null
    }
  });
});

app.post('/api/auth/logout', auth, (req, res) => {
  res.json({ success: true });
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.json(user);
});

app.put('/api/auth/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user.userId);
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong old password' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true });
});

/************************************************
 * USER ROUTES (ADMIN)
 ************************************************/
app.post('/api/users', auth, role(['admin']), async (req, res) => {
  const { username, email, password, userType, userMainId } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashed,
    userType,
    userMainId
  });

  res.json(user);
});

app.get('/api/users', auth, role(['admin']), async (req, res) => {
  res.json(await User.find().select('-password'));
});

app.get('/api/users/:id', auth, role(['admin']), async (req, res) => {
  res.json(await User.findById(req.params.id).select('-password'));
});

app.get('/api/users/role/:role', auth, role(['admin', 'dispatcher', 'client']), async (req, res) => {
  res.json(
    await User.find({ userType: req.params.role }).select('-password')
  );
});
app.get('/api/jobs/user/:userId/completed', auth, async (req, res) => {
  const { userId } = req.params;

  // validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const jobs = await Job.find({
      assignedTo: userId,
      isCompleted: true,
    }).populate('assignedTo', 'username userType');

    res.json(jobs);
  } catch (err) {
    console.error('Completed jobs fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.put('/api/users/:id', auth, role(['admin']), async (req, res) => {
  res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete('/api/users/:id', auth, role(['admin']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/************************************************
 * ADDRESS ROUTES
 ************************************************/
app.post('/api/addresses', auth, role(['admin', 'dispatcher']), async (req, res) => {
  res.json(await Address.create(req.body));
});

app.get('/api/addresses', auth, async (req, res) => {
  res.json(await Address.find());
});

app.put('/api/addresses/:id', auth, async (req, res) => {
  res.json(await Address.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete('/api/addresses/:id', auth, async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/************************************************
 * JOB ROUTES
 ************************************************/
app.post('/api/jobs', auth, async (req, res) => {
  const job = await Job.create({
    jobNumber: req.body.jobNumber,
    customer: req.body.customer,
    uplift: req.body.uplift,
    offload: req.body.offload,
    jobStart: new Date(req.body.jobStart),
    size: req.body.size,
    slot: req.body.slot,
    pin: req.body.pin,
    random: req.body.random,
    doors: req.body.doors,
    commodityCode: req.body.commodityCode,
    dg: req.body.dg === true || req.body.dg === "true",
    instructions: req.body.instructions,
    weight: Number(req.body.weight),
    release: req.body.release,
    containerNumber: req.body.containerNumber,
    createdBy: req.user.userId,
    isCompleted: false,
    status: [{ stage: 'accept' }]
  });

  res.json(job);
});



app.get('/api/jobs', auth, async (req, res) => {
  const query = { isCompleted: false };
  if (req.user.userType === 'client') {
    query.createdBy = req.user.userId;
  }

  const jobs = await Job.find(query)
    .populate('assignedTo', 'username userType');
  res.json(jobs);
});

app.get('/api/jobs/unassigned', auth, async (req, res) => {
  res.json(await Job.find({ assignedTo: null, isCompleted: false }));
});

app.get('/api/jobs/completed', auth, async (req, res) => {
  const query = { isCompleted: true };
  if (req.user.userType === 'client') {
    query.createdBy = req.user.userId;
  }

  const jobs = await Job.find(query)
    .populate('assignedTo', 'username userType userMainId');

  res.json(jobs);
});
app.get('/api/jobs/:id', auth, async (req, res) => {
  res.json(await Job.findById(req.params.id));
});

app.get('/api/jobs/user/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  console.log("User Id", userId);


  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid userId" });
  }

  const jobs = await Job.find({
    assignedTo: userId,
    isCompleted: false
  }).populate('assignedTo', 'username userType');

  res.json(jobs);
});

app.put('/api/jobs/:id', auth, role(['admin', 'dispatcher', 'client']), async (req, res) => {
  res.json(await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.put("/api/jobs/:id/container", auth, async (req, res) => {
  try {
    const { containerNumber } = req.body;

    if (!containerNumber) {
      return res.status(400).json({ message: "Container required" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.containerNumber = containerNumber;
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.put('/api/jobs/:id/assign', auth, role(['admin', 'dispatcher']), async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { assignedTo: userId },
    { new: true }
  ).populate('assignedTo', 'username userType');


  console.log(job, "Job");

  res.json(job);
});

app.put('/api/jobs/:id/status', auth, async (req, res) => {
  const { stage } = req.body;

  if (!['accept', 'uplift', 'offload', 'done'].includes(stage)) {
    return res.status(400).json({ message: 'Invalid stage' });
  }

  const job = await Job.findById(req.params.id).populate('createdBy');

  job.status.push({ stage });

  if (stage === 'done') {
    job.isCompleted = true;
    if (job.createdBy && job.createdBy.email) {
      sendCompletionEmail(job.createdBy.email, job.jobNumber, job.customer);
    }
  }

  await job.save();
  res.json(job);
});


app.get('/api/jobs/:id/status', auth, async (req, res) => {
  const job = await Job.findById(req.params.id, 'status');
  res.json(job.status);
});

app.delete('/api/jobs/:id', auth, role(['admin']), async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.put("/api/jobs/:id/proof", auth, async (req, res) => {
  const { notes, images } = req.body;

  const job = await Job.findById(req.params.id).populate('createdBy');

  if (job.isCompleted) {
    return res.status(400).json({ message: "Already completed" });
  }

  job.proof = {
    notes,
    images,
    submittedAt: new Date(),
  };

  job.status.push({ stage: "done" });
  job.isCompleted = true;

  if (job.createdBy && job.createdBy.email) {
    sendCompletionEmail(job.createdBy.email, job.jobNumber, job.customer);
  }

  await job.save();
  res.json(job);
});

/************************************************
 * SAFETY FORM ROUTES
 ************************************************/
app.post('/api/safetyForms', auth, async (req, res) => {
  res.json(await SafetyForm.create(req.body));
});

app.get('/api/safetyForms', auth, role(['admin']), async (req, res) => {
  res.json(await SafetyForm.find());
});

app.get('/api/safetyForms/:id', auth, role(['admin']), async (req, res) => {
  res.json(await SafetyForm.findById(req.params.id));
});

app.get('/api/safetyForms/job/:jobNumber', auth, async (req, res) => {
  res.json(await SafetyForm.find({ jobNumber: req.params.jobNumber }));
});

/************************************************
 * REPORT ROUTES
 ************************************************/
app.get('/api/reports/jobs', auth, role(['admin', 'dispatcher', 'client']), async (req, res) => {
  const { from, to } = req.query;

  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const query = {
    isCompleted: true,
    updatedAt: { $gte: start, $lte: end }
  };
  if (req.user.userType === 'client') {
    query.createdBy = req.user.userId;
  }

  const jobs = await Job.find(query).populate('assignedTo', 'username');

  res.json(jobs);
});

app.get('/api/reports/today', auth, role(['admin', 'dispatcher', 'client']), async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const query = { createdAt: { $gte: start } };
  if (req.user.userType === 'client') {
    query.createdBy = req.user.userId;
  }
  res.json(await Job.find(query));
});

app.get('/api/reports/summary', auth, role(['admin', 'dispatcher', 'client']), async (req, res) => {
  const query = {};
  if (req.user.userType === 'client') {
    query.createdBy = req.user.userId;
  }
  const total = await Job.countDocuments(query);
  const completed = await Job.countDocuments({ ...query, isCompleted: true });
  res.json({ total, completed });
});

app.get('/api/reports/jobs/date/:date', auth, role(['admin', 'dispatcher', 'client']), async (req, res) => {
  const { date } = req.params;

  // start of day
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  // end of day
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  try {
    const query = {
      isCompleted: true,
      updatedAt: { $gte: start, $lte: end }
    };
    if (req.user.userType === 'client') {
      query.createdBy = req.user.userId;
    }

    const jobs = await Job.find(query).populate('assignedTo', 'username');

    res.json(jobs);
  } catch (err) {
    console.error('Single date report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/************************************************
 * START SERVER
 ************************************************/
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
