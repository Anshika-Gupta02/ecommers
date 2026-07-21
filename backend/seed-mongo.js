import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for Windows Node.js DNS resolution for mongodb+srv
dns.setServers(['8.8.8.8', '1.1.1.1']);
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import CartItem from './models/CartItem.js';
import Order from './models/Order.js';
import ContactInquiry from './models/ContactInquiry.js';
import PromoCode from './models/PromoCode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

async function seedMongo() {
  console.log('🌱 Starting MongoDB Atlas seeding for Anshika\'s Store...');

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);

    // Clear existing data
    console.log('🧹 Clearing existing collection data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await CartItem.deleteMany({});
    await Order.deleteMany({});
    await ContactInquiry.deleteMany({});
    await PromoCode.deleteMany({});

    // 1. Seed Categories
    console.log('🏷️ Seeding categories...');
    const categoryData = [
      {
        name: 'Bedsheets',
        description: 'Luxury organic Egyptian cotton bedsheets and pre-washed French linen duvet covers.',
        image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Pillow Covers',
        description: 'Delicately smocked and hand-embroidered organic cotton and linen pillowcases.',
        image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600'
      },
      {
        name: 'Blankets & Throws',
        description: 'Cozy knitted throws and lightweight quilted bedspreads featuring botanical details.',
        image_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600'
      }
    ];

    const insertedCategories = await Category.insertMany(categoryData);
    const categoryMap = {};
    insertedCategories.forEach(c => {
      categoryMap[c.name] = c._id;
    });

    // 2. Seed Users
    console.log('👤 Seeding users...');
    const adminPassHash = await bcrypt.hash('adminpassword', 10);
    const customerPassHash = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        name: 'Anshika Admin',
        email: 'admin@aguabendita.com',
        password_hash: adminPassHash,
        role: 'admin'
      },
      {
        name: 'Jane Doe',
        email: 'customer@gmail.com',
        password_hash: customerPassHash,
        role: 'customer'
      }
    ];
    await User.insertMany(usersData);

    // 3. Seed Products
    console.log('👗 Seeding products...');
    const productsData = [
      {
        category: categoryMap['Bedsheets'],
        name: 'Orchid Embroidered Bedsheet Set',
        description: 'Exquisite sheet set in 400-thread-count organic Egyptian cotton, featuring hand-guided botanical orchid embroidery along the borders. Set includes one flat sheet, one fitted sheet, and two standard pillowcases.',
        price: 240.00,
        size_options: ['Queen', 'King', 'Cal King'],
        details: 'Fabric: 100% Organic Egyptian Cotton (400 TC). Care: Machine wash warm on gentle cycle, tumble dry low. Details: Luxurious sateen weave, hand-embroidered orchid borders, fits mattresses up to 16" deep.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600', is_primary: true },
          { image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600', is_primary: false }
        ]
      },
      {
        category: categoryMap['Bedsheets'],
        name: 'French Olive Linen Duvet Cover',
        description: 'Pre-washed French flax linen duvet cover in a rich, warm olive green hue. Incredibly breathable and naturally temperature-regulating, gaining softness with every wash.',
        price: 310.00,
        size_options: ['Queen', 'King'],
        details: 'Fabric: 100% French Flax Linen. Care: Machine wash cold, tumble dry low or hang dry. Details: Pre-washed for premium texture, interior corner ties to secure duvet insert, hidden coconut shell button closure.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600', is_primary: true },
          { image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600', is_primary: false }
        ]
      },
      {
        category: categoryMap['Bedsheets'],
        name: 'Jungle Bloom Fitted Sheet',
        description: 'Bring dynamic color to your bedroom with this fitted sheet, crafted in 300-thread-count organic cotton and printed with custom hand-illustrated tropical jungle blooms.',
        price: 160.00,
        size_options: ['Twin', 'Full', 'Queen', 'King'],
        details: 'Fabric: 100% Organic Cotton Percale. Care: Machine wash cold, tumble dry medium. Details: Crisp and cool percale weave, continuous elastic hem for a snug fit, certified eco-friendly dyes.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600', is_primary: true }
        ]
      },
      {
        category: categoryMap['Pillow Covers'],
        name: 'Lavanda Embroidered Pillowcase Set',
        description: 'Set of two organic cotton sateen pillowcases adorned with delicate, hand-embroidered lavender sprigs along the cuffs. Elegant, soft, and romantic addition to your bedscape.',
        price: 70.00,
        size_options: ['Standard', 'King'],
        details: 'Fabric: 100% Organic Cotton Sateen. Care: Machine wash warm, iron if needed. Details: Envelope closure, hand-embroidered floral design, pack of two.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1616627547471-217cfcd77528?auto=format&fit=crop&q=80&w=600', is_primary: true },
          { image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600', is_primary: false }
        ]
      },
      {
        category: categoryMap['Pillow Covers'],
        name: 'Palma Linen Cushion Cover',
        description: 'Square decorative cushion cover featuring hand-painted palm leaves on an organic linen-silk blend background. The perfect artisanal accent for your bed or reading chair.',
        price: 55.00,
        size_options: ['18x18', '20x20'],
        details: 'Fabric: 70% Linen, 30% Silk. Care: Dry clean only. Details: Hand-painted botanical motif, invisible zipper closure, insert not included.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600', is_primary: true }
        ]
      },
      {
        category: categoryMap['Pillow Covers'],
        name: 'Rosa Smocked Pillowcase Set',
        description: 'Set of two pillowcases crafted in organic cotton percale and finished with vintage-inspired smocked detailing on the borders. Colored in a soft, dreamy rose water shade.',
        price: 80.00,
        size_options: ['Standard', 'Euro'],
        details: 'Fabric: 100% Organic Cotton Percale. Care: Machine wash cold, dry on low. Details: Intricate smocked hem, envelope cuff closure, set of two.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', is_primary: true }
        ]
      },
      {
        category: categoryMap['Blankets & Throws'],
        name: 'Amapola Knitted Throw Blanket',
        description: 'Cozy and heavy throw blanket knitted from pure recycled cotton threads. Adorned with a custom, hand-guided jacquard floral Amapola (poppy) design with fringed hems.',
        price: 150.00,
        size_options: ['O/S'],
        details: 'Fabric: 100% Recycled Cotton. Care: Hand wash cold or dry clean. Dimensions: 50" W x 60" L. Details: Fringed edges, soft jacquard knit pattern.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600', is_primary: true }
        ]
      },
      {
        category: categoryMap['Blankets & Throws'],
        name: 'Girasol Quilted Bedspread',
        description: 'Lightweight quilted bedspread in a botanical sunflower pattern. Features hand-stitched quilting lines and a soft cotton filling, providing comfortable warmth on cooler nights.',
        price: 340.00,
        size_options: ['Queen/King'],
        details: 'Fabric: 100% Cotton shell and fill. Care: Machine wash cold on delicate cycle. Details: Hand-quilted, double-sided design, sunflower motif, lightweight.',
        images: [
          { image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600', is_primary: true }
        ]
      }
    ];
    await Product.insertMany(productsData);

    // 4. Seed Contact Inquiries
    console.log('📬 Seeding contact inquiries...');
    const inquiriesData = [
      {
        name: 'Sarah Connor',
        email: 'sarah@gmail.com',
        subject: 'Custom Bedspread size query',
        message: 'Hello, I wanted to ask if you can make a custom 100x100 inch bedspread in the Girasol Sunflower pattern?'
      },
      {
        name: 'David Beckham',
        email: 'david@yahoo.com',
        subject: 'Wholesale query for boutique hotel',
        message: 'We are starting a luxury boutique villa in Maldives and would love to buy 50 sets of French Olive Linen Duvet Covers. Do you have bulk discounts?'
      }
    ];
    await ContactInquiry.insertMany(inquiriesData);

    // 5. Seed Promo Codes
    console.log('🏷️ Seeding promo codes...');
    const promoCodesData = [
      { code: 'LINEN10', discount_percent: 10, is_active: true },
      { code: 'WELCOME20', discount_percent: 20, is_active: true },
      { code: 'SPRING15', discount_percent: 15, is_active: true },
      { code: 'EXPIRED5', discount_percent: 5, is_active: false }
    ];
    await PromoCode.insertMany(promoCodesData);

    console.log('✨ MongoDB Atlas successfully seeded with store data for Anshika\'s Store!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding MongoDB database:', error);
    process.exit(1);
  }
}

seedMongo();
