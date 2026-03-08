const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/usersModel');
const Job = require('./models/jobModel');

dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Find an admin or dispatcher to assign as default creator
    const creator = await User.findOne({ userType: { $in: ['admin', 'dispatcher'] } });
    if (!creator) {
      console.error('No admin or dispatcher found to assign as creator');
      process.exit(1);
    }

    console.log(`Assigning jobs to default creator: ${creator.username} (${creator._id})`);

    const result = await Job.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: creator._id } }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} jobs.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
