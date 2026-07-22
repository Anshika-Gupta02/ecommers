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

const MONGO_URI = process.env.MONGO_URI;

console.log('Trying to connect to MongoDB with DNS fix...');
console.log('URI:', MONGO_URI ? MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'Undefined'); // hide password

if (!MONGO_URI) {
  console.error('MONGO_URI is missing in .env');
  process.exit(1);
}

try {
  const conn = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`✅ Connection Successful! Host: ${conn.connection.host}`);
  
  // Try querying collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in database:');
  collections.forEach(col => console.log(` - ${col.name}`));
  
  await mongoose.disconnect();
  console.log('Disconnected successfully.');
  process.exit(0);
} catch (error) {
  console.error(`❌ Connection Failed: ${error.message}`);
  process.exit(1);
}
