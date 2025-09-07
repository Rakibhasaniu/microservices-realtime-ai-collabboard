import { env } from './config/index';
import connectDB from './config/database';
import RedisConfig from './config/redis';
import app from './app';

async function startApp() {
  try {
    // Connect to databases
    await connectDB();
    
    const redis = RedisConfig.getInstance();
    await redis.connect();
    
    // Test Redis connection
    const redisClient = redis.getClient();
    await redisClient.set('test', 'Hello Redis!');
    await redisClient.get('test');
    
    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      // Server started successfully
    });
    
    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      server.close(() => {
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      server.close(() => {
        process.exit(0);
      });
    });
    
  } catch (error) {
    process.exit(1);
  }
}

startApp();