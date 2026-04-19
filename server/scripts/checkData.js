import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

dotenv.config();

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    const users = await User.countDocuments();
    const trips = await Trip.countDocuments();
    
    console.log('\n📊 Database Stats:');
    console.log(`Users: ${users}`);
    console.log(`Trips: ${trips}`);
    
    if (users > 0) {
      const userList = await User.find().select('name email').limit(5);
      console.log('\n👥 Sample Users:');
      userList.forEach(u => console.log(`  - ${u.name} (${u.email})`));
    }
    
    if (trips > 0) {
      const tripList = await Trip.find().select('destination date createdBy').limit(5).populate('createdBy', 'name');
      console.log('\n🗺️  Sample Trips:');
      tripList.forEach(t => console.log(`  - ${t.destination} on ${t.date} by ${t.createdBy?.name || 'Unknown'}`));
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
