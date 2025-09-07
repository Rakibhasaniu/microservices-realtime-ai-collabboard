import { createClient, RedisClientType } from "redis";
import { env } from "./env";



class RedisConfig {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private static instance: RedisConfig

  private constructor() {
    this.client = createClient({
      url: env.REDIS_URL
    });
    this.publisher = createClient({
      url: env.REDIS_URL
    });
    this.subscriber = createClient({
      url: env.REDIS_URL
    });
    this.setupEventHandlers()
  }

  public static getInstance(): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig();
    }
    return RedisConfig.instance;
  }
  private setupEventHandlers(): void {
    // Main client events
    this.client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('🔗 Redis Client Connected');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis Client Ready');
    });

    // Publisher events
    this.publisher.on('error', (err) => {
      console.error('❌ Redis Publisher Error:', err);
    });

    // Subscriber events
    this.subscriber.on('error', (err) => {
      console.error('❌ Redis Subscriber Error:', err);
    });
  }

  public async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.publisher.connect(),
        this.subscriber.connect()
      ])
      console.log('🎯 All Redis connections established');

    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public getPublisher(): RedisClientType {
    return this.publisher;
  }

  public getSubscriber(): RedisClientType {
    return this.subscriber;
  }
}
export default RedisConfig;