import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function getAllUsersWithPlans() {
  try {
    // Find all users and select relevant fields
    const users = await User.find({})
      .select('name email username phone phoneVerified subscription createdAt')
      .sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('\n❌ No users found in the database.');
      return;
    }

    console.log(`\n📊 Found ${users.length} user account(s):\n`);
    console.log('=' .repeat(100));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. USER ACCOUNT:`);
      console.log('   ' + '-'.repeat(80));
      console.log(`   Name:           ${user.name}`);
      console.log(`   Email:          ${user.email}`);
      console.log(`   Username:       ${user.username || 'Not set'}`);
      console.log(`   Phone:          ${user.phone || 'Not set'}`);
      console.log(`   Phone Verified: ${user.phoneVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created:        ${user.createdAt.toLocaleString()}`);
      
      // Display subscription/plan details
      if (user.subscription && user.subscription.plan) {
        console.log(`\n   📦 SUBSCRIPTION PLAN:`);
        console.log(`   Plan Type:      ${user.subscription.plan.toUpperCase()}`);
        
        if (user.subscription.startDate) {
          console.log(`   Start Date:     ${new Date(user.subscription.startDate).toLocaleDateString()}`);
        }
        
        if (user.subscription.endDate) {
          console.log(`   End Date:       ${new Date(user.subscription.endDate).toLocaleDateString()}`);
        }
        
        console.log(`   Auto Renew:     ${user.subscription.autoRenew ? '✅ Yes' : '❌ No'}`);
        
        if (user.subscription.benefits && user.subscription.benefits.length > 0) {
          console.log(`   Benefits:       ${user.subscription.benefits.join(', ')}`);
        }
      } else {
        console.log(`\n   📦 SUBSCRIPTION PLAN: None (Free/Basic tier)`);
      }
      
      console.log('   ' + '-'.repeat(80));
    });

    console.log('\n' + '='.repeat(100));
    console.log(`\n✅ Total accounts retrieved: ${users.length}\n`);

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the script
getAllUsersWithPlans();
