import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import aboutRoutes from './routes/about.js';
import termsRoutes from './routes/terms.js';
import enquiryRoutes from './routes/enquiries.js';
import dashboardRoutes from './routes/dashboard.js';
import socialRoutes from './routes/social.js';
import settingsRoutes from './routes/settings.js';
import winzQuotesRoutes from './routes/winz-quotes.js';
import privacyRoutes from './routes/privacy.js';
import showroomsRoutes from './routes/showrooms.js';
import deliveryInfoRoutes from './routes/delivery-info.js';
import shopFurnitureRoutes from './routes/shop-furniture.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({
  origin: [
    'https://affurnishings.techniks.co.nz',
    'https://affurnishingsadmin.techniks.co.nz',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5005',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/winz-quotes', winzQuotesRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/showrooms', showroomsRoutes);
app.use('/api/delivery-info', deliveryInfoRoutes);
app.use('/api/shop-furniture', shopFurnitureRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function autoSetup() {
  console.log('Setting up SQLite database...');

  pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Admin',
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      profile_image TEXT,
      role TEXT DEFAULT 'admin',
      otp TEXT,
      otp_expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      mrp REAL NOT NULL,
      selling_price REAL,
      discounted_price REAL,
      description TEXT,
      stock INTEGER DEFAULT 0,
      material TEXT,
      color TEXT,
      size TEXT,
      dimensions TEXT,
      weight REAL,
      warranty TEXT,
      delivery_info TEXT,
      featured INTEGER DEFAULT 0,
      new_arrival INTEGER DEFAULT 0,
      images TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      product_id INTEGER,
      product_name TEXT,
      message TEXT,
      reply TEXT DEFAULT NULL,
      replied_at TEXT DEFAULT NULL,
      reply_read INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      type TEXT DEFAULT 'product',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      tagline TEXT,
      description TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('Tables ready.');

  // New tables
  pool.execute(`
    CREATE TABLE IF NOT EXISTS winz_quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      product_name TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS privacy_policy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS showrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS delivery_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS shop_furniture (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migrate: add new columns if missing
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN reply TEXT DEFAULT NULL"); } catch {}
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN replied_at TEXT DEFAULT NULL"); } catch {}
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN reply_read INTEGER DEFAULT 0"); } catch {}

  const [socialExists] = pool.execute('SELECT id FROM social_links LIMIT 1');
  if (socialExists.length === 0) {
    pool.execute('INSERT INTO social_links (platform, url, icon, sort_order, enabled) VALUES (?, ?, ?, ?, ?)', ['Instagram', 'https://www.instagram.com/', 'instagram', 1, 1]);
    pool.execute('INSERT INTO social_links (platform, url, icon, sort_order, enabled) VALUES (?, ?, ?, ?, ?)', ['Facebook', 'https://www.facebook.com/', 'facebook', 2, 1]);
  }

  const [settingsExist] = pool.execute('SELECT key FROM site_settings LIMIT 1');
  if (settingsExist.length === 0) {
    pool.execute("INSERT INTO site_settings (key, value) VALUES ('primary_color', '#28241f')");
    pool.execute("INSERT INTO site_settings (key, value) VALUES ('accent_color', '#aa7a3e')");
    pool.execute("INSERT INTO site_settings (key, value) VALUES ('bg_color', '#fffdf9')");
    pool.execute("INSERT INTO site_settings (key, value) VALUES ('text_color', '#28241f')");
    pool.execute("INSERT INTO site_settings (key, value) VALUES ('button_color', '#29251f')");
    pool.execute("INSERT INTO site_settings (key, value) VALUES ('header_bg', '#29251f')");
  }

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const [existing] = pool.execute('SELECT id FROM users WHERE email = ?', ['admin@gmail.com']);
  if (existing.length === 0) {
    pool.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@gmail.com', hashedPassword, 'admin']);
    console.log('Admin created: admin@gmail.com / admin123');
  }

  const categories = ['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor'];
  for (const cat of categories) {
    const [existingCat] = pool.execute('SELECT id FROM categories WHERE name = ?', [cat]);
    if (existingCat.length === 0) {
      pool.execute('INSERT INTO categories (name) VALUES (?)', [cat]);
    }
  }

  const [aboutExists] = pool.execute('SELECT id FROM about LIMIT 1');
  if (aboutExists.length === 0) {
    pool.execute(
      'INSERT INTO about (company_name, tagline, description, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
      ['AF Furnishings', 'Comfort made for everyday living.', 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete.', 'Auckland, New Zealand', '12345667890', 'affurniture@gmail.com']
    );
  }

  const [termsExists] = pool.execute('SELECT id FROM terms LIMIT 1');
  if (termsExists.length === 0) {
    pool.execute('INSERT INTO terms (content) VALUES (?)',
      ['Terms & Conditions\n\n1. General\nThese terms govern your use of AF Furnishings products and services.\n\n2. Products\nAll product images are for illustration purposes only.\n\n3. Pricing\nAll prices are in NZD and include GST unless otherwise stated.\n\n4. Delivery\nDelivery times are estimates only.\n\n5. Returns\nProducts may be returned within 14 days of purchase in original condition.\n\n6. Warranty\nAll products come with a manufacturer warranty.\n\n7. Payment\nWe accept credit card, debit card, and weekly payment plans.\n\n8. Privacy\nYour personal information is handled in accordance with our Privacy Policy and NZ law.']
    );
  }

  const [productExists] = pool.execute('SELECT id FROM products LIMIT 1');
  if (productExists.length === 0) {
    const sampleProducts = [
      { name: 'Marina Lounge Chair', cat: 'Living Room', mrp: 1299, selling: 1099, desc: 'Comfortable lounge chair with premium fabric upholstery.', stock: 15, material: 'Oak Wood', color: 'Grey', size: 'Medium', featured: 1 },
      { name: 'Haven Three Seat Sofa', cat: 'Living Room', mrp: 2499, selling: 2199, desc: 'Spacious three seat sofa perfect for family lounges.', stock: 8, material: 'Pine Wood', color: 'Navy Blue', size: 'Large', featured: 1 },
      { name: 'Ember Two Seat Sofa', cat: 'Living Room', mrp: 1899, selling: 1699, desc: 'Compact two seat sofa with modern design.', stock: 12, material: 'Metal Frame', color: 'Charcoal', size: 'Medium', featured: 0 },
      { name: 'Harbour Corner Sofa', cat: 'Living Room', mrp: 3299, selling: 2899, desc: 'L-shaped corner sofa for spacious living rooms.', stock: 5, material: 'Oak Wood', color: 'Beige', size: 'Extra Large', featured: 1 },
      { name: 'Willow Bedroom Set', cat: 'Bedroom', mrp: 2199, selling: 1999, desc: 'Complete bedroom set with bed frame and side tables.', stock: 10, material: 'Solid Wood', color: 'Walnut', size: 'King', featured: 1 },
      { name: 'Cloud Queen Bed', cat: 'Bedroom', mrp: 1599, selling: 1399, desc: 'Comfortable queen bed with padded headboard.', stock: 7, material: 'Pine Wood', color: 'White', size: 'Queen', featured: 0 },
      { name: 'Solace Bedside Pair', cat: 'Bedroom', mrp: 499, selling: 449, desc: 'Pair of matching bedside tables with drawer storage.', stock: 20, material: 'MDF', color: 'Oak', size: 'Small', featured: 0 },
      { name: 'Grace Six Drawer Set', cat: 'Bedroom', mrp: 899, selling: 799, desc: 'Six drawer chest for ample clothing storage.', stock: 14, material: 'Solid Wood', color: 'White', size: 'Medium', featured: 0 },
      { name: 'Haven Dining Table', cat: 'Dining', mrp: 1799, selling: 1599, desc: 'Solid wood dining table seats six comfortably.', stock: 9, material: 'Solid Oak', color: 'Natural', size: 'Large', featured: 1 },
      { name: 'Oak Dining Chair', cat: 'Dining', mrp: 349, selling: 299, desc: 'Elegant dining chair with cushioned seat.', stock: 30, material: 'Oak Wood', color: 'Natural', size: 'Medium', featured: 0 },
      { name: 'Gathering Table Set', cat: 'Dining', mrp: 2299, selling: 1999, desc: 'Complete dining set with table and six chairs.', stock: 4, material: 'Solid Wood', color: 'Walnut', size: 'Large', featured: 1 },
      { name: 'Arden Sideboard', cat: 'Dining', mrp: 1199, selling: 1049, desc: 'Modern sideboard with cabinet and drawer storage.', stock: 6, material: 'MDF Oak Veneer', color: 'Oak', size: 'Large', featured: 0 },
    ];

    for (const p of sampleProducts) {
      const [catRow] = pool.execute('SELECT id FROM categories WHERE name = ?', [p.cat]);
      const catId = catRow.length > 0 ? catRow[0].id : null;
      pool.execute(
        'INSERT INTO products (name, category_id, mrp, selling_price, description, stock, material, color, size, featured, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.name, catId, p.mrp, p.selling, p.desc, p.stock, p.material, p.color, p.size, p.featured, JSON.stringify([])]
      );
    }
    console.log('Sample products created.');
  }

  console.log('Setup complete!');
}

autoSetup();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});
