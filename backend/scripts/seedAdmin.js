require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@deliverguard.ai' });
  if (existing) {
    console.log('Admin already exists.');
    console.log('   Email   : admin@deliverguard.ai');
    console.log('   Password: Admin@1234');
    process.exit(0);
  }

  await User.create({
    name: 'Super Admin',
    email: 'admin@deliverguard.ai',
    phone: '9000000000',
    password: 'Admin@1234',
    role: 'admin',
    onboardingComplete: true,
  });

  console.log('✅ Admin created successfully');
  console.log('   Email   : admin@deliverguard.ai');
  console.log('   Password: Admin@1234');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
