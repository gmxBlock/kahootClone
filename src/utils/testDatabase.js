const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🧪 Starting database connection test...');
  console.log('📊 MongoDB URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
  
  try {
    // Connect to database
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thinkaton');
    console.log('✅ Connected to database successfully');

    // Test database operations
    console.log('\n📋 Running database tests...');

    // Test 1: Count existing users
    const existingUserCount = await User.countDocuments();
    console.log(`📊 Existing users in database: ${existingUserCount}`);

    // Test 2: Create a test user
    const timestamp = Date.now();
    const testUser = new User({
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'testpassword123'
    });

    console.log('🧪 Creating test user...');
    const savedUser = await testUser.save();
    console.log('✅ Test user created successfully:', {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      createdAt: savedUser.createdAt
    });

    // Test 3: Verify user exists in database
    const foundUser = await User.findById(savedUser._id);
    console.log('🔍 Verification query result:', foundUser ? 'User found' : 'User NOT found');

    // Test 4: Query user by email
    const userByEmail = await User.findOne({ email: savedUser.email });
    console.log('📧 User found by email:', userByEmail ? 'Yes' : 'No');

    // Test 5: Update user
    savedUser.username = `updated_${timestamp}`;
    await savedUser.save();
    console.log('✏️  User updated successfully');

    // Test 6: Count users again
    const newUserCount = await User.countDocuments();
    console.log(`📊 Total users after test: ${newUserCount}`);

    // Test 7: Clean up - delete test user
    await User.findByIdAndDelete(savedUser._id);
    console.log('🧹 Test user deleted successfully');

    // Final count
    const finalUserCount = await User.countDocuments();
    console.log(`📊 Final user count: ${finalUserCount}`);

    // Test 8: Database stats
    const stats = await mongoose.connection.db.stats();
    console.log('\n📈 Database statistics:', {
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024).toFixed(2)} KB`,
      storageSize: `${(stats.storageSize / 1024).toFixed(2)} KB`,
      indexes: stats.indexes
    });

    console.log('\n✅ All database tests completed successfully!');
    console.log('🎉 Your database connection is working perfectly!');

  } catch (error) {
    console.error('\n❌ Database test failed:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Suggestion: Make sure MongoDB is running');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Suggestion: Check your MongoDB credentials');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Suggestion: Check your network connection');
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔴 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection();
