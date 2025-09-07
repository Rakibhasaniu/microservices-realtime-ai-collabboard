import RedisConfig from '../config/redis';

export const sessionUtils = {
  
  async setSession(userId: string, sessionData: any, expiresInSeconds: number = 86400): Promise<void> {
    try {
      const redis = RedisConfig.getInstance().getClient();
      const key = `session:${userId}`;
      
      await redis.setEx(key, expiresInSeconds, JSON.stringify({
        ...sessionData,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000)
      }));
      
      console.log('✅ Session stored successfully');
      
    } catch (error) {
      console.error('❌ Error storing session:', error);
      throw error;
    }
  },

  async getSession(userId: string): Promise<any | null> {
    try {
      const redis = RedisConfig.getInstance().getClient();
      const key = `session:${userId}`;
      
      // console.log('📖 Retrieving session for user:', userId);
      
      const session = await redis.get(key);
      
      if (!session) {
        console.log('⚠️ No session found for user:', userId);
        return null;
      }
      
      const parsedSession = JSON.parse(session);
      // console.log('✅ Session retrieved successfully');
      return parsedSession;
      
    } catch (error) {
      console.error('❌ Error retrieving session:', error);
      return null;
    }
  },

  // 🗑️ Delete user session (logout)
  async deleteSession(userId: string): Promise<void> {
    try {
      const redis = RedisConfig.getInstance().getClient();
      const key = `session:${userId}`;
      
      // console.log('🗑️ Deleting session for user:', userId);
      
      await redis.del(key);
      // console.log('✅ Session deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting session:', error);
      throw error;
    }
  },

  // ❓ Check if session exists
  async sessionExists(userId: string): Promise<boolean> {
    try {
      const redis = RedisConfig.getInstance().getClient();
      const key = `session:${userId}`;
      
      const exists = await redis.exists(key) === 1;
      // console.log('❓ Session exists for user', userId, ':', exists);
      return exists;
      
    } catch (error) {
      console.error('❌ Error checking session:', error);
      return false;
    }
  },

  // ⏱️ Extend session expiry
  async extendSession(userId: string, additionalSeconds: number = 86400): Promise<void> {
    try {
      const redis = RedisConfig.getInstance().getClient();
      const key = `session:${userId}`;
      
      // console.log('⏱️ Extending session for user:', userId);
      
      await redis.expire(key, additionalSeconds);
      // console.log('✅ Session extended successfully');
      
    } catch (error) {
      console.error('❌ Error extending session:', error);
      throw error;
    }
  }
};