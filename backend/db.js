import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for Windows Node.js DNS SRV resolution for MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    if (!MONGO_URI) {
      console.warn('⚠️ MONGO_URI missing in backend/.env');
      return null;
    }

    // Connect to MongoDB Atlas with optimized timeouts (5s server selection)
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`💡 Note: Please verify MONGO_URI and password in backend/.env.`);
    return null;
  }
}

export default mongoose;
