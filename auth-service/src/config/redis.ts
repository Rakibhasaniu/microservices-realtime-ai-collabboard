import { createClient, RedisClientType } from 'redis';
import { env } from './index';

class RedisConfig {
  private client: RedisClientType;
  private static instance: RedisConfig;

  private constructor() {
    console.log('🔧 Creating Redis client...');
    
    this.client = createClient({
      url: env.REDIS_URL
    });

    this.setupEventHandlers();
  }

  public static getInstance(): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig();
    }
    return RedisConfig.instance;
  }

  private setupEventHandlers(): void {
    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    this.client.on('connect', () => {
      console.log('🔗 Redis connecting...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis ready!');
    });
  }

  public async connect(): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
        console.log('🎯 Redis connected successfully');
      }
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }
}

export default RedisConfig;