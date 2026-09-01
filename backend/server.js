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
import deliveryInfoRoutes from './routes/delivery-info.js';
import returnsRoutes from './routes/returns.js';
import financeApplicationRoutes from './routes/finance-applications.js';
import storeLocationRoutes from './routes/store-locations.js';
import aboutSectionsRoutes from './routes/about-sections.js';
import uploadRoutes from './routes/upload.js';
import subcategoryRoutes from './routes/subcategories.js';
import adCampaignRoutes from './routes/ad-campaigns.js';
import dynamicPageRoutes from './routes/dynamic-pages.js';
import testimonialRoutes from './routes/testimonials.js';
import pagesRoutes from './routes/pages.js';
import contactRoutes from './routes/contact.js';
import notificationRoutes from './routes/notifications.js';
import dealsRoutes from './routes/deals.js';
import homepageRoutes from './routes/homepage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.NODE_PORT || 5000;

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

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
app.use('/api/delivery-info', deliveryInfoRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/finance-applications', financeApplicationRoutes);
app.use('/api/store-locations', storeLocationRoutes);
app.use('/api/about-sections', aboutSectionsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/ad-campaigns', adCampaignRoutes);
app.use('/api/dynamic-pages', dynamicPageRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/homepage', homepageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), port: PORT });
});

app.get('/api/cors-test', (req, res) => {
  res.json({ status: 'cors ok', origin: req.headers.origin });
});

const IMG = {
  catLiving: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
  catBedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  catDining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
  catOffice: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
  catOutdoor: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  storeAuckland: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80',
  storeWellington: 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=900&q=80',
  hero1: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80',
  hero2: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  hero3: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=80',
  ad1: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1400&q=80',
  ad2: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
  ad3: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
  p1: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  p2: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80',
  p3: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=600&q=80',
  p4: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=600&q=80',
  p5: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
  p6: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
  p7: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=600&q=80',
  p8: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=600&q=80',
  p9: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80',
  p10: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format&fit=crop&w=600&q=80',
  p11: 'https://images.unsplash.com/photo-1611967164521-abae8fba4668?auto=format&fit=crop&w=600&q=80',
  p12: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
  p13: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
  p14: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?auto=format&fit=crop&w=600&q=80',
  p15: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=600&q=80',
  p16: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
  p17: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
  p18: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  p19: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=600&q=80',
  p20: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=600&q=80',
};

async function autoSetup() {
  console.log('Setting up SQLite database...');

  pool.execute(`CREATE TABLE IF NOT EXISTS users (
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
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    image TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS products (
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
    on_sale INTEGER DEFAULT 0,
    weekly_price REAL,
    images TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS enquiries (
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
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS about (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    tagline TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS winz_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    product_name TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS privacy_policy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS delivery_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS finance_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    income_source TEXT,
    products TEXT,
    documents TEXT DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS store_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    google_map_url TEXT,
    latitude TEXT,
    longitude TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS about_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL UNIQUE,
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS ad_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT DEFAULT '',
    link TEXT DEFAULT '',
    position TEXT DEFAULT 'homepage',
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS dynamic_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    content TEXT DEFAULT '',
    banner_image TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  pool.execute(`CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Customer',
    quote TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    location TEXT DEFAULT '',
    rating INTEGER DEFAULT 5,
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);

  console.log('Tables ready.');

  try { pool.execute("ALTER TABLE products ADD COLUMN subcategory_id INTEGER"); } catch {}
  try { pool.execute("ALTER TABLE products ADD COLUMN slug TEXT"); } catch {}
  try { pool.execute("ALTER TABLE products ADD COLUMN brand TEXT"); } catch {}
  try { pool.execute("ALTER TABLE products ADD COLUMN on_sale INTEGER DEFAULT 0"); } catch {}
  try { pool.execute("ALTER TABLE products ADD COLUMN weekly_price REAL"); } catch {}
  try { pool.execute("ALTER TABLE categories ADD COLUMN image TEXT DEFAULT ''"); } catch {}
  try { pool.execute("ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0"); } catch {}
  try { pool.execute("ALTER TABLE subcategories ADD COLUMN sort_order INTEGER DEFAULT 0"); } catch {}
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN reply TEXT DEFAULT NULL"); } catch {}
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN replied_at TEXT DEFAULT NULL"); } catch {}
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN reply_read INTEGER DEFAULT 0"); } catch {}
  try { pool.execute("ALTER TABLE store_locations ADD COLUMN image TEXT DEFAULT ''"); } catch {}

  const [socialExists] = pool.execute('SELECT id FROM social_links LIMIT 1');
  if (socialExists.length === 0) {
    pool.execute('INSERT INTO social_links (platform, url, icon, sort_order, enabled) VALUES (?, ?, ?, ?, ?)', ['Instagram', 'https://www.instagram.com/affurnishings/', 'instagram', 1, 1]);
    pool.execute('INSERT INTO social_links (platform, url, icon, sort_order, enabled) VALUES (?, ?, ?, ?, ?)', ['Facebook', 'https://www.facebook.com/affurnishings', 'facebook', 2, 1]);
  }

  const [settingsExist] = pool.execute('SELECT `key` FROM site_settings LIMIT 1');
  if (settingsExist.length === 0) {
    const settings = [
      ['primary_color', '#28241f'],
      ['accent_color', '#aa7a3e'],
      ['bg_color', '#fffdf9'],
      ['text_color', '#28241f'],
      ['button_color', '#29251f'],
      ['header_bg', '#29251f'],
      ['site_name', 'AF Furnishings'],
      ['site_tagline', 'Quality furniture for every New Zealand home'],
      ['announcement_bar_text', 'Welcome to AF Furnishings \u2022 Quality pieces for every home'],
      ['contact_phone', '0800 222 548'],
      ['contact_email', 'affurniture@gmail.com'],
      ['contact_address', 'Auckland, New Zealand'],
      ['operating_hours', 'Mon - Sat: 9:00 AM - 5:30 PM | Sun: 10:00 AM - 4:00 PM'],
      ['facebook_url', 'https://facebook.com/affurnishings'],
      ['instagram_url', 'https://instagram.com/affurnishings'],
      ['footer_text', '\u00a9 2026 AF Furnishings. All rights reserved.'],
      ['footer_tagline', 'Secure payments \u2022 Friendly service \u2022 Home delivery'],
      ['deals', JSON.stringify({
        title: 'Limited-Time Weekly Deals',
        subtitle: 'Comfortable furniture at straightforward prices. Flexible weekly payments available.',
        cards: [
          { icon: 'delivery', title: 'NZ Wide Delivery', description: 'Fast and reliable delivery to your doorstep anywhere in New Zealand.' },
          { icon: 'payment', title: 'Easy Weekly Payment Plans', description: 'Spread the cost with simple weekly instalments that suit your budget.' },
          { icon: 'shield', title: 'Interest-Free Available', description: 'Enjoy flexible finance options with interest-free payment plans.' }
        ]
      })],
    ];
    for (const [k, v] of settings) {
      pool.execute("INSERT INTO site_settings (`key`, `value`) VALUES (?, ?)", [k, v]);
    }
  }

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const [existing] = pool.execute('SELECT id FROM users WHERE email = ?', ['admin@gmail.com']);
  if (existing.length === 0) {
    pool.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@gmail.com', hashedPassword, 'admin']);
    console.log('Admin created: admin@gmail.com / admin123');
  } else {
    pool.execute('UPDATE users SET password = ?, email = ? WHERE email = ?', [hashedPassword, 'admin@gmail.com', 'admin@gmail.com']);
  }

  const categoryImages = {
    'Living Room': IMG.catLiving,
    'Bedroom': IMG.catBedroom,
    'Dining': IMG.catDining,
    'Office': IMG.catOffice,
    'Outdoor': IMG.catOutdoor
  };
  const categories = ['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor'];
  for (let i = 0; i < categories.length; i++) {
    const [existingCat] = pool.execute('SELECT id FROM categories WHERE name = ?', [categories[i]]);
    if (existingCat.length === 0) {
      pool.execute('INSERT INTO categories (name, image, sort_order) VALUES (?, ?, ?)', [categories[i], categoryImages[categories[i]], i]);
    }
  }

  const [subcatExists] = pool.execute('SELECT id FROM subcategories LIMIT 1');
  if (subcatExists.length === 0) {
    const subcats = [
      ['Sofas', 'Living Room', 0], ['Armchairs', 'Living Room', 1], ['Coffee Tables', 'Living Room', 2], ['TV Units', 'Living Room', 3],
      ['Bed Frames', 'Bedroom', 0], ['Mattresses', 'Bedroom', 1], ['Bedroom Sets', 'Bedroom', 2], ['Dressers', 'Bedroom', 3],
      ['Dining Suites', 'Dining', 0], ['Dining Tables', 'Dining', 1], ['Dining Chairs', 'Dining', 2], ['Sideboards', 'Dining', 3],
      ['Desks', 'Office', 0], ['Office Chairs', 'Office', 1], ['Bookshelves', 'Office', 2], ['Accessories', 'Office', 3],
      ['Outdoor Seating', 'Outdoor', 0], ['Outdoor Dining', 'Outdoor', 1], ['Loungers', 'Outdoor', 2], ['Accessories', 'Outdoor', 3],
    ];
    for (const [name, cat, order] of subcats) {
      const [catRow] = pool.execute('SELECT id FROM categories WHERE name = ?', [cat]);
      if (catRow.length > 0) {
        pool.execute('INSERT INTO subcategories (name, category_id, sort_order) VALUES (?, ?, ?)', [name, catRow[0].id, order]);
      }
    }
    console.log('Subcategories seeded.');
  }

  const [aboutExists] = pool.execute('SELECT id FROM about LIMIT 1');
  if (aboutExists.length === 0) {
    pool.execute('INSERT INTO about (company_name, tagline, description, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
      ['AF Furnishings', 'Comfort made for everyday living.', 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. With over 15 years serving New Zealand families, we pride ourselves on offering beautifully crafted pieces at honest prices.', '123 Queen Street, Auckland, New Zealand', '0800 222 548', 'affurniture@gmail.com']);
  }

  const aboutSectionTypes = [
    { type: 'main_banner', title: 'Welcome to AF Furnishings', description: 'We provide quality furniture, beds and appliances to make your home feel complete.' },
    { type: 'primary_section', title: 'About Us', description: 'AF Furnishings is a family-owned New Zealand furniture retailer with over 15 years of experience. We believe every home deserves beautiful furniture without the premium price tag.' },
    { type: 'features', title: 'Why Choose Us', description: 'Handpicked materials, flexible weekly payments, and nationwide delivery make us the go-to choice for Kiwi homes.' },
    { type: 'conclusion', title: 'Visit Our Showroom', description: 'Come visit us in Auckland or Wellington to experience our collections in person.' }
  ];
  for (const sec of aboutSectionTypes) {
    const [secExists] = pool.execute('SELECT id FROM about_sections WHERE type=?', [sec.type]);
    if (secExists.length === 0) {
      pool.execute('INSERT INTO about_sections (type, title, description, image) VALUES (?, ?, ?, ?)', [sec.type, sec.title, sec.description, '']);
    }
  }

  const [termsExists] = pool.execute('SELECT id FROM terms LIMIT 1');
  if (termsExists.length === 0) {
    pool.execute('INSERT INTO terms (content) VALUES (?)',
      ['Terms & Conditions\n\n1. General\nThese terms govern your use of AF Furnishings products and services.\n\n2. Products\nAll product images are for illustration purposes only. Actual product may vary slightly.\n\n3. Pricing\nAll prices are in NZD and include GST unless otherwise stated. Prices may change without notice.\n\n4. Delivery\nDelivery times are estimates only. We aim to deliver within 5-10 business days.\n\n5. Returns\nProducts may be returned within 14 days of purchase in original condition with proof of purchase.\n\n6. Warranty\nAll products come with a manufacturer warranty covering manufacturing defects.\n\n7. Payment\nWe accept credit card, debit card, and weekly payment plans through our finance partners.\n\n8. Privacy\nYour personal information is handled in accordance with our Privacy Policy and NZ law.']);
  }

  const [dynamicPagesExist] = pool.execute('SELECT id FROM dynamic_pages LIMIT 1');
  if (dynamicPagesExist.length === 0) {
    pool.execute("INSERT INTO dynamic_pages (slug, title, category, content, banner_image, meta_description, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ['about-us', 'About Us', 'Company', '<h2>Welcome to AF Furnishings</h2><p>AF Furnishings is a family-owned New Zealand furniture retailer with over 15 years of experience. We provide quality furniture, beds and appliances to make your home feel complete.</p><p>Our mission is to help every Kiwi create a comfortable, beautiful home without breaking the bank.</p>', '', 'About AF Furnishings - Quality furniture for every NZ home', 1, 1]);
  }

  const [productExists] = pool.execute('SELECT id FROM products LIMIT 1');
  if (productExists.length === 0) {
    const sampleProducts = [
      { name: 'Marina Lounge Chair', cat: 'Living Room', sub: 'Armchairs', mrp: 1299, selling: 1099, desc: 'Comfortable lounge chair with premium fabric upholstery and solid oak legs. Perfect for reading nooks and living rooms.', stock: 15, material: 'Oak Wood', color: 'Grey', size: 'Medium', featured: 1, on_sale: 1, img: IMG.p1 },
      { name: 'Haven Three Seat Sofa', cat: 'Living Room', sub: 'Sofas', mrp: 2499, selling: 2199, desc: 'Spacious three seat sofa perfect for family lounges. Deep cushioning with durable linen-look fabric.', stock: 8, material: 'Pine Wood', color: 'Navy Blue', size: 'Large', featured: 1, on_sale: 1, img: IMG.p2 },
      { name: 'Ember Two Seat Sofa', cat: 'Living Room', sub: 'Sofas', mrp: 1899, selling: 1699, desc: 'Compact two seat sofa with modern clean lines. Ideal for apartments and smaller spaces.', stock: 12, material: 'Metal Frame', color: 'Charcoal', size: 'Medium', featured: 0, on_sale: 1, img: IMG.p3 },
      { name: 'Harbour Corner Sofa', cat: 'Living Room', sub: 'Sofas', mrp: 3299, selling: 2899, desc: 'L-shaped corner sofa for spacious living rooms. Modular design with reversible chaise.', stock: 5, material: 'Oak Wood', color: 'Beige', size: 'Extra Large', featured: 1, on_sale: 1, img: IMG.p4 },
      { name: 'Willow Bedroom Set', cat: 'Bedroom', sub: 'Bedroom Sets', mrp: 2199, selling: 1999, desc: 'Complete bedroom set with bed frame, two side tables and matching dresser. Solid timber construction.', stock: 10, material: 'Solid Wood', color: 'Walnut', size: 'King', featured: 1, on_sale: 1, img: IMG.p5 },
      { name: 'Cloud Queen Bed', cat: 'Bedroom', sub: 'Bed Frames', mrp: 1599, selling: 1399, desc: 'Comfortable queen bed with padded headboard. Easy assembly with included hardware.', stock: 7, material: 'Pine Wood', color: 'White', size: 'Queen', featured: 0, on_sale: 1, img: IMG.p6 },
      { name: 'Solace Bedside Pair', cat: 'Bedroom', sub: 'Bed Frames', mrp: 499, selling: 449, desc: 'Pair of matching bedside tables with drawer storage. Clean Scandinavian design.', stock: 20, material: 'MDF', color: 'Oak', size: 'Small', featured: 0, on_sale: 1, img: IMG.p7 },
      { name: 'Grace Six Drawer Dresser', cat: 'Bedroom', sub: 'Dressers', mrp: 899, selling: 799, desc: 'Six drawer chest for ample clothing storage. Soft-close drawers with solid wood frame.', stock: 14, material: 'Solid Wood', color: 'White', size: 'Medium', featured: 0, on_sale: 1, img: IMG.p8 },
      { name: 'Haven Dining Table', cat: 'Dining', sub: 'Dining Tables', mrp: 1799, selling: 1599, desc: 'Solid wood dining table seats six comfortably. Natural oak finish with tapered legs.', stock: 9, material: 'Solid Oak', color: 'Natural', size: 'Large', featured: 1, on_sale: 1, img: IMG.p9 },
      { name: 'Oak Dining Chair', cat: 'Dining', sub: 'Dining Chairs', mrp: 349, selling: 299, desc: 'Elegant dining chair with cushioned seat and solid oak frame. Sold individually.', stock: 30, material: 'Oak Wood', color: 'Natural', size: 'Medium', featured: 0, on_sale: 1, img: IMG.p10 },
      { name: 'Gathering Table Set', cat: 'Dining', sub: 'Dining Suites', mrp: 2299, selling: 1999, desc: 'Complete dining set with table and six chairs. Perfect for family gatherings.', stock: 4, material: 'Solid Wood', color: 'Walnut', size: 'Large', featured: 1, on_sale: 1, img: IMG.p11 },
      { name: 'Arden Sideboard', cat: 'Dining', sub: 'Sideboards', mrp: 1199, selling: 1049, desc: 'Modern sideboard with cabinet and drawer storage. Stylish addition to any dining room.', stock: 6, material: 'MDF Oak Veneer', color: 'Oak', size: 'Large', featured: 0, on_sale: 1, img: IMG.p12 },
      { name: 'Executive Office Desk', cat: 'Office', sub: 'Desks', mrp: 899, selling: 799, desc: 'Spacious executive desk with cable management and drawer storage. Professional finish.', stock: 11, material: 'MDF', color: 'Walnut', size: 'Large', featured: 1, on_sale: 0, img: IMG.p13 },
      { name: 'Ergonomic Office Chair', cat: 'Office', sub: 'Office Chairs', mrp: 699, selling: 599, desc: 'Fully adjustable ergonomic chair with lumbar support and breathable mesh back.', stock: 18, material: 'Mesh', color: 'Black', size: 'Medium', featured: 1, on_sale: 0, img: IMG.p14 },
      { name: 'Modern Bookshelf', cat: 'Office', sub: 'Bookshelves', mrp: 549, selling: 479, desc: 'Five tier open bookshelf with industrial metal frame and wood shelves.', stock: 13, material: 'Metal & Wood', color: 'Natural', size: 'Large', featured: 0, on_sale: 0, img: IMG.p15 },
      { name: 'Standing Desk Converter', cat: 'Office', sub: 'Desks', mrp: 449, selling: 399, desc: 'Height-adjustable standing desk converter. Easily switches between sitting and standing.', stock: 22, material: 'Steel', color: 'White', size: 'Medium', featured: 0, on_sale: 0, img: IMG.p16 },
      { name: 'Teak Outdoor Lounge Set', cat: 'Outdoor', sub: 'Outdoor Seating', mrp: 2999, selling: 2599, desc: 'Weather-resistant teak outdoor lounge set with all-weather cushions. Seats four.', stock: 3, material: 'Teak Wood', color: 'Natural', size: 'Extra Large', featured: 1, on_sale: 0, img: IMG.p17 },
      { name: 'Outdoor Dining Set', cat: 'Outdoor', sub: 'Outdoor Dining', mrp: 1899, selling: 1699, desc: 'Six piece outdoor dining set with aluminium frame and tempered glass top.', stock: 6, material: 'Aluminium', color: 'Grey', size: 'Large', featured: 1, on_sale: 0, img: IMG.p18 },
      { name: 'Garden Bench', cat: 'Outdoor', sub: 'Outdoor Seating', mrp: 399, selling: 349, desc: 'Classic two-seater garden bench with curved armrests. Treated timber for weather resistance.', stock: 16, material: 'Treated Pine', color: 'Natural', size: 'Medium', featured: 0, on_sale: 0, img: IMG.p19 },
      { name: 'Patio Sun Lounger', cat: 'Outdoor', sub: 'Loungers', mrp: 599, selling: 499, desc: 'Adjustable patio sun lounger with removable cushion and wheels for easy movement.', stock: 9, material: 'Aluminium & Textilene', color: 'Charcoal', size: 'Large', featured: 0, on_sale: 1, img: IMG.p20 },
    ];

    for (const p of sampleProducts) {
      const [catRow] = pool.execute('SELECT id FROM categories WHERE name = ?', [p.cat]);
      const catId = catRow.length > 0 ? catRow[0].id : null;
      let subId = null;
      if (p.sub) {
        const [subRow] = pool.execute('SELECT id FROM subcategories WHERE name = ? AND category_id = ?', [p.sub, catId]);
        subId = subRow.length > 0 ? subRow[0].id : null;
      }
      const weeklyPrice = Math.ceil((p.selling || p.mrp) / 52);
      pool.execute(
        'INSERT INTO products (name, category_id, subcategory_id, mrp, selling_price, description, stock, material, color, size, featured, on_sale, weekly_price, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.name, catId, subId, p.mrp, p.selling, p.desc, p.stock, p.material, p.color, p.size, p.featured, p.on_sale, weeklyPrice, JSON.stringify([p.img])]
      );
    }
    console.log('Sample products created.');
  }

  const [testimonialExists] = pool.execute('SELECT id FROM testimonials LIMIT 1');
  if (testimonialExists.length === 0) {
    const testimonials = [
      { name: 'Sarah Mitchell', role: 'Homeowner', quote: 'The quality of our new sofa exceeded all expectations. AF Furnishings made the whole process seamless from browsing to delivery.', location: 'Auckland', rating: 5 },
      { name: 'James Chen', role: 'Interior Designer', quote: 'I recommend AF Furnishings to all my clients. Their range is fantastic and the quality is consistently excellent.', location: 'Wellington', rating: 5 },
      { name: 'Emma Rodriguez', role: 'First Home Buyer', quote: 'Furnished our entire first home from AF Furnishings. Great value for money and the delivery team was wonderful.', location: 'Hamilton', rating: 5 },
      { name: 'David Patel', role: 'Business Owner', quote: 'Outfitting our office was a breeze with AF Furnishings. Professional service and quality products at competitive prices.', location: 'Auckland', rating: 5 },
      { name: 'Lisa Thompson', role: 'Repeat Customer', quote: 'This is our third purchase from AF Furnishings. The bedroom set is absolutely stunning and so comfortable.', location: 'Christchurch', rating: 5 },
      { name: 'Michael Wang', role: 'Renovator', quote: 'During our home renovation, AF Furnishings provided beautiful pieces that transformed our living spaces completely.', location: 'Tauranga', rating: 5 },
      { name: 'Rachel Kelly', role: 'Mum of Three', quote: 'Durable, stylish and affordable. Everything I need as a busy mum. The kids love their new beds too!', location: 'Dunedin', rating: 5 },
      { name: 'Tom Nguyen', role: 'Property Manager', quote: 'Reliable supplier for all our rental properties. Consistent quality and great wholesale pricing options.', location: 'Palmerston North', rating: 5 },
    ];
    for (const t of testimonials) {
      pool.execute('INSERT INTO testimonials (name, role, quote, location, rating, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [t.name, t.role, t.quote, t.location, t.rating, 0, 1]);
    }
  }

  const [storeExists] = pool.execute('SELECT id FROM store_locations LIMIT 1');
  if (storeExists.length === 0) {
    pool.execute('INSERT INTO store_locations (name, address, city, phone, email, google_map_url, latitude, longitude, description, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['AF Furnishings Auckland', '123 Queen Street', 'Auckland', '0800 222 548', 'affurniture@gmail.com', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.3!2d174.76!3d-36.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1', '-36.85', '174.76', 'Central Auckland showroom with over 200 furniture displays. Open by appointment.', IMG.storeAuckland, 1]);
    pool.execute('INSERT INTO store_locations (name, address, city, phone, email, google_map_url, latitude, longitude, description, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['AF Furnishings Wellington', '45 Cuba Street', 'Wellington', '0800 222 548', 'affurniture@gmail.com', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.3!2d174.77!3d-41.29!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1', '-41.29', '174.77', 'Wellington design studio with curated collections. Open by appointment.', IMG.storeWellington, 2]);
  }

  const [adExists] = pool.execute('SELECT id FROM ad_campaigns LIMIT 1');
  if (adExists.length === 0) {
    pool.execute('INSERT INTO ad_campaigns (name, image, link, position, sort_order, active) VALUES (?, ?, ?, ?, ?, ?)',
      ['Living Room Sale', IMG.ad1, '/on-sale', 'homepage', 0, 1]);
    pool.execute('INSERT INTO ad_campaigns (name, image, link, position, sort_order, active) VALUES (?, ?, ?, ?, ?, ?)',
      ['Bedroom Collection', IMG.ad2, '/category/bedroom', 'homepage', 1, 1]);
    pool.execute('INSERT INTO ad_campaigns (name, image, link, position, sort_order, active) VALUES (?, ?, ?, ?, ?, ?)',
      ['Finance Available', IMG.ad3, '/apply-for-finance', 'homepage', 2, 1]);
  }

  try {
    const [productsNeedingSlugs] = await pool.execute(
      'SELECT p.id, p.name, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug IS NULL OR p.slug = \'\''
    );
    for (const p of productsNeedingSlugs) {
      const baseSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const catPrefix = p.category_name ? p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
      let slug = catPrefix ? `${catPrefix}-${baseSlug}` : baseSlug;
      const [existingSlug] = await pool.execute('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, p.id]);
      if (existingSlug.length > 0) {
        let suffix = 2;
        while (true) {
          const testSlug = `${catPrefix ? catPrefix + '-' : ''}${baseSlug}-${suffix}`;
          const [dup] = await pool.execute('SELECT id FROM products WHERE slug = ?', [testSlug]);
          if (dup.length === 0) { slug = testSlug; break; }
          suffix++;
        }
      }
      await pool.execute('UPDATE products SET slug = ? WHERE id = ?', [slug, p.id]);
    }
    if (productsNeedingSlugs.length > 0) console.log(`Generated slugs for ${productsNeedingSlugs.length} products`);
  } catch (err) { console.error('Slug generation error:', err.message); }

  console.log('Setup complete!');
}

autoSetup();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});
