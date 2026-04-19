import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Trip from '../models/Trip.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '../.env') });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function getAllTrips() {
  try {
    const trips = await Trip.find({})
      .populate('creator', 'name email')
      .select('title from to creator isPublic createdAt date')
      .sort({ createdAt: -1 });

    console.log(`\n📍 Total trips in database: ${trips.length}\n`);
    console.log('='.repeat(100));

    trips.forEach((trip, index) => {
      console.log(`\n${index + 1}. ${trip.title}`);
      console.log(`   From: ${trip.from} → To: ${trip.to}`);
      console.log(`   Creator: ${trip.creator?.name} (${trip.creator?.email})`);
      console.log(`   Date: ${trip.date}`);
      console.log(`   Public: ${trip.isPublic ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${trip.createdAt.toLocaleString()}`);
    });

    console.log('\n' + '='.repeat(100));
    
    // Group by creator
    const byCreator = {};
    trips.forEach(trip => {
      const email = trip.creator?.email || 'Unknown';
      if (!byCreator[email]) byCreator[email] = [];
      byCreator[email].push(trip);
    });

    console.log('\n📊 Trips grouped by creator:\n');
    Object.entries(byCreator).forEach(([email, trips]) => {
      console.log(`${email}: ${trips.length} trip(s)`);
      trips.forEach(t => console.log(`  - ${t.title}`));
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

getAllTrips();
