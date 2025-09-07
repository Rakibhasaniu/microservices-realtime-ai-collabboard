// import { env } from './config/env';
// import connectDB from './config/database';
// import RedisConfig from './config/redis';

// async function startWhiteboardService() {
//   try {
//     console.log('🎨 Starting Whiteboard Service...');
//     console.log(`📋 Service: ${env.SERVICE_NAME}`);
//     console.log(`🌍 Environment: ${env.NODE_ENV}`);
//     console.log(`🔌 Port: ${env.PORT}`);
//     console.log(`🔗 Auth Service: ${env.AUTH_SERVICE_URL}`);
    
//     // Step 1: Connect to databases
//     console.log('\n🔗 Connecting to databases...');
//     await connectDB();
//     console.log('✅ MongoDB connected for Whiteboard Service');
    
//     const redis = RedisConfig.getInstance();
//     await redis.connect();
    
//     // Test Redis connections
//     const redisClient = redis.getClient();
//     await redisClient.set('whiteboard-test', 'Hello Socket.io!');
//     const testValue = await redisClient.get('whiteboard-test');
//     console.log('🧪 Redis test result:', testValue);
    
//     console.log('✅ All database connections established');
//     console.log('🎉 Whiteboard Service setup complete!');
//     console.log('\n📚 Next: We will add Socket.io server and real-time features');
    
//   } catch (error) {
//     console.error('💥 Startup failed:', error);
//     process.exit(1);
//   }
// }

// startWhiteboardService();

import { env } from './config/env';
import connectDB from './config/database';
import RedisConfig from './config/redis';
import { DocumentService } from './services/documentService';

async function testDocumentModel() {
  console.log('\n🧪 Testing Document Model...');
  
  const documentService = new DocumentService();
  
  try {
    // Test 1: Create a document
    console.log('\n📝 Test 1: Creating document...');
    const createResult = await documentService.createDocument({
      title: 'My First Collaborative Doc',
      ownerId: 'user123',
      ownerName: 'John Doe',
      content: 'Hello, this is a collaborative document!',
      isPublic: false
    });
    
    console.log('✅ Create result:', {
      success: createResult.success,
      message: createResult.message,
      documentId: createResult.document?._id
    });
    
    if (createResult.success && createResult.document) {
      const docId = createResult.document._id.toString();
      
      // Test 2: Get the document
      console.log('\n📖 Test 2: Getting document...');
      const getResult = await documentService.getDocument(docId, 'user123');
      console.log('✅ Get result:', {
        success: getResult.success,
        title: getResult.document?.title,
        content: getResult.document?.content?.substring(0, 30) + '...',
        collaborators: getResult.document?.collaborators.length
      });
      
      // Test 3: Add collaborator
      console.log('\n👥 Test 3: Adding collaborator...');
      const addCollabResult = await documentService.addCollaborator(docId, 'user123', {
        userId: 'user456',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        role: 'editor'
      });
      console.log('✅ Add collaborator result:', {
        success: addCollabResult.success,
        collaborators: addCollabResult.document?.collaborators.length
      });
      
      // Test 4: Join document (simulate real-time)
      console.log('\n🚪 Test 4: Joining document...');
      const joinResult = await documentService.joinDocument(docId, 'user456');
      console.log('✅ Join result:', {
        success: joinResult.success,
        activeUsers: joinResult.document?.activeUsers.length
      });
      
      // Test 5: Get user's documents
      console.log('\n📚 Test 5: Getting user documents...');
      const userDocsResult = await documentService.getUserDocuments('user123');
      console.log('✅ User docs result:', {
        success: userDocsResult.success,
        count: userDocsResult.documents?.length
      });
      
      // Test 6: Update document
      console.log('\n✏️ Test 6: Updating document...');
      const updateResult = await documentService.updateDocument(docId, 'user123', {
        content: 'Hello, this is an UPDATED collaborative document! Real-time editing works!'
      });
      console.log('✅ Update result:', {
        success: updateResult.success,
        version: updateResult.document?.version
      });
    }
    
    console.log('\n🎉 All document model tests completed!');
    
  } catch (error) {
    console.error('❌ Document model test failed:', error);
  }
}

async function startWhiteboardService() {
  try {
    console.log('🎨 Starting Whiteboard Service...');
    console.log(`📋 Service: ${env.SERVICE_NAME}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔌 Port: ${env.PORT}`);
    
    // Connect to databases
    await connectDB();
    console.log('✅ MongoDB connected for Whiteboard Service');
    
    const redis = RedisConfig.getInstance();
    await redis.connect();
    console.log('✅ Redis connections established');
    
    // Test our document model
    await testDocumentModel();
    
    console.log('\n📚 Next: We will add Socket.io server for real-time features!');
    
  } catch (error) {
    console.error('💥 Startup failed:', error);
    process.exit(1);
  }
}

startWhiteboardService();