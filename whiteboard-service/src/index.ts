import { env } from './config/env';
import connectDB from './config/database';
import RedisConfig from './config/redis';

async function startWhiteboardService() {
  try {
    console.log('🎨 Starting Whiteboard Service...');
    console.log(`📋 Service: ${env.SERVICE_NAME}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔌 Port: ${env.PORT}`);
    console.log(`🔗 Auth Service: ${env.AUTH_SERVICE_URL}`);
    
    // Step 1: Connect to databases
    console.log('\n🔗 Connecting to databases...');
    await connectDB();
    console.log('✅ MongoDB connected for Whiteboard Service');
    
    const redis = RedisConfig.getInstance();
    await redis.connect();
    
    // Test Redis connections
    const redisClient = redis.getClient();
    await redisClient.set('whiteboard-test', 'Hello Socket.io!');
    const testValue = await redisClient.get('whiteboard-test');
    console.log('🧪 Redis test result:', testValue);
    
    console.log('✅ All database connections established');
    console.log('🎉 Whiteboard Service setup complete!');
    console.log('\n📚 Next: We will add Socket.io server and real-time features');
    
  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

startWhiteboardService();