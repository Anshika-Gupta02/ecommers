import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for Windows Node.js DNS SRV resolution (only on Windows)
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore DNS set errors if restricted
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

mongoose.set('bufferCommands', false);

let connectionPromise = null;

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      await mongoose.connection.asPromise();
      return mongoose.connection;
    }

    if (connectionPromise) {
      await connectionPromise;
      return mongoose.connection;
    }

    if (!MONGO_URI) {
      console.warn('⚠️ MONGO_URI missing in environment variables');
      return null;
    }

    // Connect once and reuse the same promise for concurrent requests.
    connectionPromise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const conn = await connectionPromise;
    connectionPromise = null;
    console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    connectionPromise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return null;
  }
}

export default mongoose;
