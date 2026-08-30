import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export async function connectDatabase(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  try {
    mongoose.set('strictQuery', true);

    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: env.NODE_ENV !== 'production',
    });

    isConnected = true;
    if (env.NODE_ENV !== 'test') {
      console.log(`✅ Connected to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      if (env.NODE_ENV !== 'test') {
        console.warn('⚠️ MongoDB disconnected.');
      }
      isConnected = false;
    });

    return connection;
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      try {
        console.warn('⚠️ Could not reach standalone MongoDB. Starting built-in in-memory database for local preview...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();
        const connection = await mongoose.connect(memoryUri);
        isConnected = true;
        console.log(`✅ Universal ERP connected to built-in database (${memoryUri})`);
        return connection;
      } catch (fallbackErr) {
        console.error('❌ Failed to start in-memory MongoDB:', fallbackErr);
      }
    }
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}
