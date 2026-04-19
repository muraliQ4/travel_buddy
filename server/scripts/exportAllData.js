import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Request from '../models/Request.js';
import RideShare from '../models/RideShare.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function exportAllData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📦 Database:', mongoose.connection.db.databaseName);
    console.log('\n' + '='.repeat(60));
    
    // Get all data
    const users = await User.find().lean();
    const trips = await Trip.find().lean();
    const requests = await Request.find().lean();
    const rideShares = await RideShare.find().lean();
    
    console.log('\n📊 DATABASE SUMMARY:');
    console.log('='.repeat(60));
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`🗺️  Total Trips: ${trips.length}`);
    console.log(`📨 Total Requests: ${requests.length}`);
    console.log(`🚗 Total RideShares: ${rideShares.length}`);
    
    // Display Users
    console.log('\n\n👥 USERS:');
    console.log('='.repeat(60));
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      if (user.bio) console.log(`   Bio: ${user.bio}`);
      if (user.interests && Array.isArray(user.interests) && user.interests.length) {
        console.log(`   Interests: ${user.interests.join(', ')}`);
      }
    });
    
    // Display Trips
    console.log('\n\n🗺️  TRIPS:');
    console.log('='.repeat(60));
    trips.forEach((trip, index) => {
      console.log(`\n${index + 1}. ${trip.title || 'Untitled Trip'}`);
      console.log(`   From: ${trip.from} → To: ${trip.to}`);
      console.log(`   Date: ${trip.date}`);
      console.log(`   Transport: ${trip.transport}`);
      console.log(`   Distance: ${trip.distance}`);
      console.log(`   Max Members: ${trip.maxMembers}`);
      console.log(`   Current Members: ${trip.members?.length || 0}`);
      console.log(`   Creator: ${trip.creatorName}`);
      console.log(`   Creator ID: ${trip.creator}`);
      console.log(`   Public: ${trip.isPublic ? 'Yes' : 'No'}`);
      console.log(`   Likes: ${trip.likes?.length || 0}`);
      if (trip.description) console.log(`   Description: ${trip.description}`);
      console.log(`   ID: ${trip._id}`);
      console.log(`   Created: ${new Date(trip.createdAt).toLocaleString()}`);
    });
    
    // Display Requests
    if (requests.length > 0) {
      console.log('\n\n📨 JOIN REQUESTS:');
      console.log('='.repeat(60));
      requests.forEach((req, index) => {
        console.log(`\n${index + 1}. Request`);
        console.log(`   From User ID: ${req.from}`);
        console.log(`   To User ID: ${req.to}`);
        console.log(`   Trip ID: ${req.trip}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   Message: ${req.message || 'No message'}`);
        console.log(`   Created: ${new Date(req.createdAt).toLocaleString()}`);
      });
    }
    
    // Display RideShares
    if (rideShares.length > 0) {
      console.log('\n\n🚗 RIDESHARE POSTS:');
      console.log('='.repeat(60));
      rideShares.forEach((ride, index) => {
        console.log(`\n${index + 1}. ${ride.title || 'Untitled Ride'}`);
        console.log(`   From: ${ride.from} → To: ${ride.to}`);
        console.log(`   Date: ${ride.date} at ${ride.time}`);
        console.log(`   Vehicle: ${ride.vehicleType}`);
        console.log(`   Available Seats: ${ride.availableSeats}`);
        console.log(`   Price: ₹${ride.pricePerSeat}/seat`);
        console.log(`   Creator ID: ${ride.creator}`);
        console.log(`   Bookings: ${ride.bookings?.length || 0}`);
        if (ride.description) console.log(`   Description: ${ride.description}`);
      });
    }
    
    // Export to JSON file
    const exportData = {
      exported: new Date().toISOString(),
      summary: {
        users: users.length,
        trips: trips.length,
        requests: requests.length,
        rideShares: rideShares.length
      },
      users,
      trips,
      requests,
      rideShares
    };
    
    const exportPath = path.join(process.cwd(), 'database_export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ Data exported to: database_export.json');
    console.log('='.repeat(60));
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

exportAllData();
