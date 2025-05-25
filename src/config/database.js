const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Enable mongoose debugging to see all database operations
    mongoose.set('debug', true);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database Details:');
    console.log(`   - Host: ${conn.connection.host}`);
    console.log(`   - Port: ${conn.connection.port}`);
    console.log(`   - Database: ${conn.connection.name}`);
    console.log(`   - Connection String: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@') : 'Not set'}`);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   - Error:', error.message);
    console.error('   - MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.error('   - Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
