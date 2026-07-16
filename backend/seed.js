import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('Starting database seeding for Anshika\'s Store...');
  
  // Connect to MySQL server without database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const dbName = process.env.DB_NAME || 'anshika_store_db';
    console.log(`Ensuring database "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // Read schema.sql
    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Strip comments from SQL
    const cleanedSql = schemaSql
      .replace(/--.*$/gm, '') // Remove single-line SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line SQL comments

    // Split queries by semicolon (making sure to handle comments and whitespace)
    const queries = cleanedSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`Executing schema tables creation (${queries.length} queries)...`);
    for (let query of queries) {
      if (query.startsWith('USE ')) continue; // Skip USE commands
      await connection.query(query);
    }
    console.log('Schema tables created successfully.');

    // Now seed data
    console.log('Seeding categories...');
    const categories = [
      ['Bedsheets', 'Luxury organic Egyptian cotton bedsheets and pre-washed French linen duvet covers.', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'],
      ['Pillow Covers', 'Delicately smocked and hand-embroidered organic cotton and linen pillowcases.', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600'],
      ['Blankets & Throws', 'Cozy knitted throws and lightweight quilted bedspreads featuring botanical details.', 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600']
    ];

    for (let cat of categories) {
      await connection.query(
        'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
        cat
      );
    }

    // Get categories with their IDs
    const [dbCategories] = await connection.query('SELECT id, name FROM categories');
    const categoryMap = {};
    dbCategories.forEach(c => {
      categoryMap[c.name] = c.id;
    });

    console.log('Seeding users...');
    const adminPassHash = await bcrypt.hash('adminpassword', 10);
    const customerPassHash = await bcrypt.hash('password123', 10);

    await connection.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Anshika Admin', 'admin@aguabendita.com', adminPassHash, 'admin']
    );

    await connection.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Jane Doe', 'customer@gmail.com', customerPassHash, 'customer']
    );

    console.log('Seeding products...');
    const products = [
      {
        category_id: categoryMap['Bedsheets'],
        name: 'Orchid Embroidered Bedsheet Set',
        description: 'Exquisite sheet set in 400-thread-count organic Egyptian cotton, featuring hand-guided botanical orchid embroidery along the borders. Set includes one flat sheet, one fitted sheet, and two standard pillowcases.',
        price: 240.00,
        size_options: JSON.stringify(['Queen', 'King', 'Cal King']),
        details: 'Fabric: 100% Organic Egyptian Cotton (400 TC). Care: Machine wash warm on gentle cycle, tumble dry low. Details: Luxurious sateen weave, hand-embroidered orchid borders, fits mattresses up to 16" deep.',
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=600'
        ]
      },
      {
        category_id: categoryMap['Bedsheets'],
        name: 'French Olive Linen Duvet Cover',
        description: 'Pre-washed French flax linen duvet cover in a rich, warm olive green hue. Incredibly breathable and naturally temperature-regulating, gaining softness with every wash.',
        price: 310.00,
        size_options: JSON.stringify(['Queen', 'King']),
        details: 'Fabric: 100% French Flax Linen. Care: Machine wash cold, tumble dry low or hang dry. Details: Pre-washed for premium texture, interior corner ties to secure duvet insert, hidden coconut shell button closure.',
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600'
        ]
      },
      {
        category_id: categoryMap['Bedsheets'],
        name: 'Jungle Bloom Fitted Sheet',
        description: 'Bring dynamic color to your bedroom with this fitted sheet, crafted in 300-thread-count organic cotton and printed with custom hand-illustrated tropical jungle blooms.',
        price: 160.00,
        size_options: JSON.stringify(['Twin', 'Full', 'Queen', 'King']),
        details: 'Fabric: 100% Organic Cotton Percale. Care: Machine wash cold, tumble dry medium. Details: Crisp and cool percale weave, continuous elastic hem for a snug fit, certified eco-friendly dyes.',
        images: [
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600'
        ]
      },
      {
        category_id: categoryMap['Pillow Covers'],
        name: 'Lavanda Embroidered Pillowcase Set',
        description: 'Set of two organic cotton sateen pillowcases adorned with delicate, hand-embroidered lavender sprigs along the cuffs. Elegant, soft, and romantic addition to your bedscape.',
        price: 70.00,
        size_options: JSON.stringify(['Standard', 'King']),
        details: 'Fabric: 100% Organic Cotton Sateen. Care: Machine wash warm, iron if needed. Details: Envelope closure, hand-embroidered floral design, pack of two.',
        images: [
          'https://images.unsplash.com/photo-1616627547471-217cfcd77528?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600'
        ]
      },
      {
        category_id: categoryMap['Pillow Covers'],
        name: 'Palma Linen Cushion Cover',
        description: 'Square decorative cushion cover featuring hand-painted palm leaves on an organic linen-silk blend background. The perfect artisanal accent for your bed or reading chair.',
        price: 55.00,
        size_options: JSON.stringify(['18x18', '20x20']),
        details: 'Fabric: 70% Linen, 30% Silk. Care: Dry clean only. Details: Hand-painted botanical motif, invisible zipper closure, insert not included.',
        images: [
          'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600'
        ]
      },
      {
        category_id: categoryMap['Pillow Covers'],
        name: 'Rosa Smocked Pillowcase Set',
        description: 'Set of two pillowcases crafted in organic cotton percale and finished with vintage-inspired smocked detailing on the borders. Colored in a soft, dreamy rose water shade.',
        price: 80.00,
        size_options: JSON.stringify(['Standard', 'Euro']),
        details: 'Fabric: 100% Organic Cotton Percale. Care: Machine wash cold, dry on low. Details: Intricate smocked hem, envelope cuff closure, set of two.',
        images: [
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'
        ]
      },
      {
        category_id: categoryMap['Blankets & Throws'],
        name: 'Amapola Knitted Throw Blanket',
        description: 'Cozy and heavy throw blanket knitted from pure recycled cotton threads. Adorned with a custom, hand-guided jacquard floral Amapola (poppy) design with fringed hems.',
        price: 150.00,
        size_options: JSON.stringify(['O/S']),
        details: 'Fabric: 100% Recycled Cotton. Care: Hand wash cold or dry clean. Dimensions: 50" W x 60" L. Details: Fringed edges, soft jacquard knit pattern.',
        images: [
          'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=600'
        ]
      },
      {
        category_id: categoryMap['Blankets & Throws'],
        name: 'Girasol Quilted Bedspread',
        description: 'Lightweight quilted bedspread in a botanical sunflower pattern. Features hand-stitched quilting lines and a soft cotton filling, providing comfortable warmth on cooler nights.',
        price: 340.00,
        size_options: JSON.stringify(['Queen/King']),
        details: 'Fabric: 100% Cotton shell and fill. Care: Machine wash cold on delicate cycle. Details: Hand-quilted, double-sided design, sunflower motif, lightweight.',
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
        ]
      }
    ];

    for (let prod of products) {
      const [result] = await connection.query(
        'INSERT INTO products (category_id, name, description, price, size_options, details) VALUES (?, ?, ?, ?, ?, ?)',
        [prod.category_id, prod.name, prod.description, prod.price, prod.size_options, prod.details]
      );
      const productId = result.insertId;

      for (let i = 0; i < prod.images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, prod.images[i], i === 0 ? 1 : 0]
        );
      }
    }

    // Seed Contact Inquiries
    console.log('Seeding contact inquiries...');
    const inquiries = [
      ['Sarah Connor', 'sarah@gmail.com', 'Custom Bedspread size query', 'Hello, I wanted to ask if you can make a custom 100x100 inch bedspread in the Girasol Sunflower pattern?'],
      ['David Beckham', 'david@yahoo.com', 'Wholesale query for boutique hotel', 'We are starting a luxury boutique villa in Maldives and would love to buy 50 sets of French Olive Linen Duvet Covers. Do you have bulk discounts?']
    ];
    for (let inq of inquiries) {
      await connection.query(
        'INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
        inq
      );
    }

    // Seed Promo Codes
    console.log('Seeding promo codes...');
    const promoCodes = [
      ['LINEN10', 10, 1],
      ['WELCOME20', 20, 1],
      ['SPRING15', 15, 1],
      ['EXPIRED5', 5, 0]
    ];
    for (let pc of promoCodes) {
      await connection.query(
        'INSERT INTO promo_codes (code, discount_percent, is_active) VALUES (?, ?, ?)',
        pc
      );
    }

    console.log('Database successfully seeded with new linen items for Anshika\'s Store.');

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await connection.end();
  }
}

runSeed();
