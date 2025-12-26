/************************************************
 * LOAD ENV FIRST
 ************************************************/
require('dotenv').config();

/************************************************
 * IMPORTS
 ************************************************/
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
app.use(cors({
  origin: [
    'https://dispacher-5dsn.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// VERY IMPORTANT: handle preflight
app.options('*', cors());
/************************************************
 * MODELS
 ************************************************/
const User = require('./models/usersModel');
const Address = require('./models/address');
const Job = require('./models/jobModel');
const SafetyForm = require('./models/safetyForm');

/************************************************
 * APP INIT
 ************************************************/
const app = express();
const port = process.env.PORT || 10000;

/************************************************
 * MIDDLEWARE
 ************************************************/
app.use(cors());
app.use(bodyParser.json());

/************************************************
 * MONGODB CONNECTION (ONCE ONLY)
 ************************************************/
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
});

/************************************************
 * ROUTES
 ************************************************/

app.get('/', (req, res) => {
  res.send('Hello, your backend is working!');
});
app.get('/api/users/usernames', async (req, res) => {
  try {
    // Fetch only username field, exclude _id
    const users = await User.find({}, { username: 1, _id: 0 });
    console.log(users);
    res.json({
      success: true,
      usernames: users.map((user) => user.username),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get('/api/users/debug', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});
/* =========================
   USER LOGIN
========================= */
app.post('/api/userlogin', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for user:', username);  
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: 'Invalid password' });

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
        userMainId: user.userMainId || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/* =========================
   GET AUTH USER
========================= */
app.get('/api/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
      userMainId: user.userMainId || null,
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

/* =========================
   CREATE USER
========================= */
app.post('/api/saveUser', async (req, res) => {
  try {
    const { username, email, password, userMainId, userType } = req.body;

    if (await User.findOne({ username })) {
      return res.json({ code: 'user', message: 'Username already exists' });
    }

    if (userMainId && (await User.findOne({ userMainId }))) {
      return res.json({ code: 'ID', message: 'UserMainId already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new User({
      username,
      email,
      password: hashedPassword,
      userType,
      userMainId,
    }).save();

    res.json({ success: true, message: 'User saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   ADDRESS
========================= */
app.post('/api/saveAddress', async (req, res) => {
  try {
    await new Address(req.body).save();
    res.json({ success: true, message: 'Address saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/addressOptions', async (req, res) => {
  res.json({ addresses: await Address.find() });
});

/* =========================
   JOBS
========================= */
app.post('/api/createJob', async (req, res) => {
  try {
    await new Job({ ...req.body, complete: 'no' }).save();
    res.json({ success: true, message: 'Job created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/allJobs', async (req, res) => {
  res.json({ jobs: await Job.find({ complete: 'no' }) });
});

app.put('/api/updateJob', async (req, res) => {
  const { selectedId, jobId } = req.body;
  const job = await Job.findByIdAndUpdate(jobId, { userMainId: selectedId }, { new: true });
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

app.put('/api/updateStatus', async (req, res) => {
  const { jobId, jobStage } = req.body;

  if (!['accept', 'uplift', 'offload', 'done'].includes(jobStage)) {
    return res.status(400).json({ error: 'Invalid stage' });
  }

  const job = await Job.findByIdAndUpdate(
    jobId,
    {
      $push: { status: { type: jobStage } },
      complete: jobStage === 'done' ? 'yes' : 'no',
    },
    { new: true }
  );

  res.json({ success: true, job });
});
app.get('/create-admin-once', async (req, res) => {
  try {
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      return res.send('Admin already exists');
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await new User({
      username: 'admin',
      email: 'admin@test.com',
      password: hashedPassword,
      userType: 'admin',
    }).save();

    res.send('✅ Admin user created');
  } catch (err) {
    res.status(500).send(err.message);
  }
});
/* =========================
   SAFETY FORM
========================= */
app.post('/api/safetyForm', async (req, res) => {
  try {
    await new SafetyForm(req.body).save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/************************************************
 * START SERVER
 ************************************************/
// app.listen(port, () => {
//   console.log(`🚀 Server running on port ${port}`);
// });
module.exports = app;
