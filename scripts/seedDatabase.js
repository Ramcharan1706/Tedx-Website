const mongoose = require('mongoose');
const Speaker = require('../src/models/Speaker');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function seed() {
  if (!uri) throw new Error('MONGODB_URI is required to seed the database.');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    await Speaker.deleteMany({});
    await Speaker.create({
      name: 'Dr. Aanya Rao',
      title: 'Futurist · Researcher',
      bio: 'Fictional sample profile used to validate the TEDxKPRIT 2026 speaker layout. Replace when the official lineup is confirmed.',
      topic: 'Beyond the Fifth Wall',
      image: 'sample-silhouette',
      socialMedia: {},
      order: 1,
      isActive: true
    });
    console.log('[seed] one 2026 sample speaker created');
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('[seed] failed:', error.message);
  process.exitCode = 1;
});
