import mongoose from 'mongoose';
import { env } from './index';


const connectDB = async (): Promise<void> => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown when app closes
    process.on('SIGINT', async () => {
      console.log('\n🔒 Shutting down gracefully...');
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;