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
import returnsRoutes from './routes/returns.js';
import financeApplicationRoutes from './routes/finance-applications.js';
import storeLocationRoutes from './routes/store-locations.js';
import heroSliderRoutes from './routes/hero-sliders.js';
import discountCodeRoutes from './routes/discount-codes.js';
import aboutSectionsRoutes from './routes/about-sections.js';
import uploadRoutes from './routes/upload.js';
import pageBannerRoutes from './routes/page-banners.js';
import subcategoryRoutes from './routes/subcategories.js';
import adCampaignRoutes from './routes/ad-campaigns.js';
import dynamicPageRoutes from './routes/dynamic-pages.js';
import testimonialRoutes from './routes/testimonials.js';
import pagesRoutes from './routes/pages.js';
import contactRoutes from './routes/contact.js';
import notificationRoutes from './routes/notifications.js';
import dealsRoutes from './routes/deals.js';

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
app.use('/api/showrooms', showroomsRoutes);
app.use('/api/delivery-info', deliveryInfoRoutes);
app.use('/api/shop-furniture', shopFurnitureRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/finance-applications', financeApplicationRoutes);
app.use('/api/store-locations', storeLocationRoutes);
app.use('/api/hero-sliders', heroSliderRoutes);
app.use('/api/discount-codes', discountCodeRoutes);
app.use('/api/about-sections', aboutSectionsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/page-banners', pageBannerRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/ad-campaigns', adCampaignRoutes);
app.use('/api/dynamic-pages', dynamicPageRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/deals', dealsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), port: PORT });
});

app.get('/api/cors-test', (req, res) => {
  res.json({ status: 'cors ok', origin: req.headers.origin });
});

async function autoSetup() {
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
      image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
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

  pool.execute(`
    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS finance_applications (
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
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS store_locations (
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
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS hero_sliders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL DEFAULT '',
      alt TEXT DEFAULT '',
      tagline TEXT DEFAULT '',
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS discount_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      value TEXT DEFAULT '10%',
      type TEXT DEFAULT 'percentage',
      min_order REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 0,
      expires_at TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS about_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS page_banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_key TEXT NOT NULL UNIQUE,
      label TEXT DEFAULT '',
      image TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT DEFAULT '',
      link TEXT DEFAULT '',
      position TEXT DEFAULT 'homepage',
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS dynamic_pages (
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
    )
  `);

  pool.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
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
    )
  `);

  // Migrate: add subcategory_id to products if missing
  try { pool.execute("ALTER TABLE products ADD COLUMN subcategory_id INTEGER"); } catch {}
  try { pool.execute("ALTER TABLE products ADD COLUMN slug TEXT"); } catch {}
  try { pool.execute("ALTER TABLE products ADD COLUMN brand TEXT"); } catch {}

  // Migrate: add category_image and sort_order to categories
  try { pool.execute("ALTER TABLE categories ADD COLUMN image TEXT DEFAULT ''"); } catch {}
  try { pool.execute("ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0"); } catch {}

  // Migrate: add sort_order to subcategories
  try { pool.execute("ALTER TABLE subcategories ADD COLUMN sort_order INTEGER DEFAULT 0"); } catch {}

  // Migrate: add new columns if missing
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN reply TEXT DEFAULT NULL"); } catch {}
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN replied_at TEXT DEFAULT NULL"); } catch {}
  try { pool.execute("ALTER TABLE enquiries ADD COLUMN reply_read INTEGER DEFAULT 0"); } catch {}
  try { pool.execute("ALTER TABLE store_locations ADD COLUMN image TEXT DEFAULT ''"); } catch {}

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

  // Auto-generate slugs for products that don't have one
  try {
    const [productsNeedingSlugs] = await pool.execute(
      `SELECT p.id, p.name, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug IS NULL OR p.slug = ''`
    );
    for (const p of productsNeedingSlugs) {
      const baseSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const catPrefix = p.category_name ? p.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
      let slug = catPrefix ? `${catPrefix}-${baseSlug}` : baseSlug;
      // Check for duplicates and append numeric suffix
      const [existing] = await pool.execute('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, p.id]);
      if (existing.length > 0) {
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

  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const [existing] = pool.execute('SELECT id FROM users WHERE email = ?', ['admin@gmail.com']);
  if (existing.length === 0) {
    pool.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@gmail.com', hashedPassword, 'admin']);
    console.log('Admin created: admin@gmail.com / admin123');
  } else {
    pool.execute('UPDATE users SET password = ?, email = ? WHERE email = ?', [hashedPassword, 'admin@gmail.com', 'admin@gmail.com']);
    console.log('Admin password reset to admin123');
  }

  const categoryImages = {
    'Living Room': '/uploads/category-living-room.jpg',
    'Bedroom': '/uploads/category-bedroom.jpg',
    'Dining': '/uploads/category-dining.jpg',
    'Office': '/uploads/category-office.jpg',
    'Outdoor': '/uploads/category-outdoor.jpg'
  };
  const categories = ['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor'];
  for (const cat of categories) {
    const [existingCat] = pool.execute('SELECT id FROM categories WHERE name = ?', [cat]);
    if (existingCat.length === 0) {
      pool.execute('INSERT INTO categories (name, image) VALUES (?, ?)', [cat, categoryImages[cat] || '']);
    }
  }

  const [aboutExists] = pool.execute('SELECT id FROM about LIMIT 1');
  if (aboutExists.length === 0) {
    pool.execute(
      'INSERT INTO about (company_name, tagline, description, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
      ['AF Furnishings', 'Comfort made for everyday living.', 'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete.', 'Auckland, New Zealand', '12345667890', 'affurniture@gmail.com']
    );
  }

  const aboutSectionTypes = [
    { type: 'main_banner', title: 'Welcome to AF Furnishings', description: 'We provide quality furniture, beds and appliances to make your home feel complete.' },
    { type: 'primary_section', title: 'About Us', description: 'AF Furnishings is a family-owned New Zealand furniture retailer with over 15 years of experience.' },
    { type: 'features', title: 'Why Choose Us', description: '' },
    { type: 'conclusion', title: 'Conclusion', description: '' }
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
      ['Terms & Conditions\n\n1. General\nThese terms govern your use of AF Furnishings products and services.\n\n2. Products\nAll product images are for illustration purposes only.\n\n3. Pricing\nAll prices are in NZD and include GST unless otherwise stated.\n\n4. Delivery\nDelivery times are estimates only.\n\n5. Returns\nProducts may be returned within 14 days of purchase in original condition.\n\n6. Warranty\nAll products come with a manufacturer warranty.\n\n7. Payment\nWe accept credit card, debit card, and weekly payment plans.\n\n8. Privacy\nYour personal information is handled in accordance with our Privacy Policy and NZ law.']
    );
  }

  const [dynamicPagesExist] = pool.execute('SELECT id FROM dynamic_pages LIMIT 1');
  if (dynamicPagesExist.length === 0) {
    pool.execute(
      "INSERT INTO dynamic_pages (slug, title, category, content, banner_image, meta_description, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ['about-us', 'About Us', 'Company', '<h2>Welcome to AF Furnishings</h2><p>AF Furnishings is a family-owned New Zealand furniture retailer with over 15 years of experience. We provide quality furniture, beds and appliances to make your home feel complete.</p><p>Our mission is to help every Kiwi create a comfortable, beautiful home without breaking the bank.</p>', '', 'About AF Furnishings - Quality furniture for every NZ home', 1, 1]
    );
    pool.execute(
      "INSERT INTO dynamic_pages (slug, title, category, content, banner_image, meta_description, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ['warranty-policy', 'Warranty Policy', 'Policies', '<h2>Our Warranty Promise</h2><p>All AF Furnishings products come with a manufacturer warranty. If you experience any issues with your purchase, contact us and we will work with you to resolve it.</p>', '', 'AF Furnishings warranty policy', 2, 1]
    );
  }

  const [productExists] = pool.execute('SELECT id FROM products LIMIT 1');

  const [storeExists] = pool.execute('SELECT id FROM store_locations LIMIT 1');
  if (storeExists.length === 0) {
    pool.execute(
      'INSERT INTO store_locations (name, address, city, phone, email, google_map_url, latitude, longitude, description, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['AF Furnishings Auckland', '123 Queen Street', 'Auckland', '12345667890', 'affurniture@gmail.com', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.3!2d174.76!3d-36.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1', '-36.85', '174.76', 'Central Auckland showroom with over 200 furniture displays.', '/uploads/store-auckland.jpg', 1]
    );
    pool.execute(
      'INSERT INTO store_locations (name, address, city, phone, email, google_map_url, latitude, longitude, description, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['AF Furnishings Wellington', '45 Cuba Street', 'Wellington', '12345667890', 'affurniture@gmail.com', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.3!2d174.77!3d-41.29!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1', '-41.29', '174.77', 'Wellington design studio with curated collections.', '/uploads/store-wellington.jpg', 2]
    );
  }
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

  const [testimonialExists] = pool.execute('SELECT id FROM testimonials LIMIT 1');
  if (testimonialExists.length === 0) {
    const testimonials = [
      { name: 'Sarah Mitchell', role: 'Homeowner', quote: 'The quality of our new sofa exceeded all expectations. AF Furnishings made the whole process seamless.', location: 'Auckland', rating: 5 },
      { name: 'James Chen', role: 'Interior Designer', quote: 'I recommend AF Furnishings to all my clients. Their range is fantastic and the quality is consistently excellent.', location: 'Wellington', rating: 5 },
      { name: 'Emma Rodriguez', role: 'First Home Buyer', quote: 'Furnished our entire first home from AF Furnishings. Great value for money and the delivery team was wonderful.', location: 'Hamilton', rating: 5 },
      { name: 'David Patel', role: 'Business Owner', quote: 'Outfitting our office was a breeze with AF Furnishings. Professional service and quality products.', location: 'Auckland', rating: 5 },
      { name: 'Lisa Thompson', role: 'Repeat Customer', quote: 'This is our third purchase from AF Furnishings. The bedroom set is absolutely stunning and so comfortable.', location: 'Christchurch', rating: 5 },
      { name: 'Michael Wang', role: 'Renovator', quote: 'During our home renovation, AF Furnishings provided beautiful pieces that transformed our living spaces.', location: 'Tauranga', rating: 5 },
      { name: 'Rachel Kelly', role: 'Mum of Three', quote: 'Durable, stylish and affordable. Everything I need as a busy mum. The kids love their new beds too!', location: 'Dunedin', rating: 5 },
      { name: 'Tom Nguyen', role: 'Property Manager', quote: 'Reliable supplier for all our rental properties. Consistent quality and great wholesale pricing.', location: 'Palmerston North', rating: 5 }
    ];
    for (const t of testimonials) {
      pool.execute(
        'INSERT INTO testimonials (name, role, quote, location, rating, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [t.name, t.role, t.quote, t.location, t.rating, 0, 1]
      );
    }
  }

  console.log('Setup complete!');
}

autoSetup();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});
