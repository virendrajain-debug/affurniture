// ============================================================
// Database Seed Script
// ============================================================
// This script populates the database with initial data:
//   - Default admin user (admin@gmail.com / admin123)
//   - 5 product categories
//   - 12 sample furniture products
//   - Default About page content
//   - Default Terms & Conditions
//
// Run once after migration: npm run seed
// Safe to run multiple times (checks for existing data).
// ============================================================

import pool from '../config/db.js';
import bcrypt from 'bcryptjs'; // For hashing passwords

async function seed() {
  try {
    console.log('Seeding database...');

    // ========================================
    // 1. CREATE DEFAULT ADMIN USER
    // ========================================
    // Password is hashed with bcrypt (10 rounds of salting)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@gmail.com']);
    
    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@gmail.com', hashedPassword, 'admin']
      );
      console.log('Default admin user created: admin@gmail.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // ========================================
    // 2. CREATE DEFAULT CATEGORIES
    // ========================================
    const categories = ['Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor'];
    for (const cat of categories) {
      const [existingCat] = await pool.execute('SELECT id FROM categories WHERE name = ?', [cat]);
      if (existingCat.length === 0) {
        await pool.execute('INSERT INTO categories (name) VALUES (?)', [cat]);
      }
    }
    console.log('Default categories created');

    // ========================================
    // 3. CREATE DEFAULT ABOUT INFO
    // ========================================
    const [aboutExists] = await pool.execute('SELECT id FROM about LIMIT 1');
    if (aboutExists.length === 0) {
      await pool.execute(
        'INSERT INTO about (company_name, tagline, description, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'AF Furnishings',
          'Comfort made for everyday living.',
          'AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. With showrooms in Auckland and Wellington, we bring comfort to homes across New Zealand.',
          'Auckland, New Zealand',
          '12345667890',
          'affurniture@gmail.com'
        ]
      );
      console.log('Default about info created');
    }

    // ========================================
    // 4. CREATE DEFAULT TERMS & CONDITIONS
    // ========================================
    const [termsExists] = await pool.execute('SELECT id FROM terms LIMIT 1');
    if (termsExists.length === 0) {
      await pool.execute(
        'INSERT INTO terms (content) VALUES (?)',
        [`Terms & Conditions

1. General
These terms and conditions govern your use of AF Furnishings products and services. By purchasing from us, you agree to these terms.

2. Products
All product images are for illustration purposes only. Actual products may vary slightly in color and texture.

3. Pricing
All prices are in NZD and include GST unless otherwise stated. We reserve the right to change prices without notice.

4. Delivery
Delivery times are estimates only. We are not liable for any delays in delivery.

5. Returns
Products may be returned within 14 days of purchase in original condition. Custom orders are non-refundable.

6. Warranty
All products come with a manufacturer's warranty as specified on the product page.

7. Payment
We accept payment via credit card, debit card, and our flexible weekly payment plans.

8. Privacy
Your personal information is handled in accordance with our Privacy Policy and NZ law.`]
      );
      console.log('Default terms created');
    }

    // ========================================
    // 5. CREATE SAMPLE PRODUCTS (12 items)
    // ========================================
    const [productExists] = await pool.execute('SELECT id FROM products LIMIT 1');
    if (productExists.length === 0) {
      // Sample product data organized by category
      const sampleProducts = [
        // --- LIVING ROOM PRODUCTS ---
        { name: 'Marina Lounge Chair', cat: 'Living Room', mrp: 1299, selling: 1099, desc: 'Comfortable lounge chair with premium fabric upholstery.', stock: 15, material: 'Oak Wood', color: 'Grey', size: 'Medium', featured: 1 },
        { name: 'Haven Three Seat Sofa', cat: 'Living Room', mrp: 2499, selling: 2199, desc: 'Spacious three seat sofa perfect for family lounges.', stock: 8, material: 'Pine Wood', color: 'Navy Blue', size: 'Large', featured: 1 },
        { name: 'Ember Two Seat Sofa', cat: 'Living Room', mrp: 1899, selling: 1699, desc: 'Compact two seat sofa with modern design.', stock: 12, material: 'Metal Frame', color: 'Charcoal', size: 'Medium', featured: 0 },
        { name: 'Harbour Corner Sofa', cat: 'Living Room', mrp: 3299, selling: 2899, desc: 'L-shaped corner sofa for spacious living rooms.', stock: 5, material: 'Oak Wood', color: 'Beige', size: 'Extra Large', featured: 1 },
        // --- BEDROOM PRODUCTS ---
        { name: 'Willow Bedroom Set', cat: 'Bedroom', mrp: 2199, selling: 1999, desc: 'Complete bedroom set with bed frame and side tables.', stock: 10, material: 'Solid Wood', color: 'Walnut', size: 'King', featured: 1 },
        { name: 'Cloud Queen Bed', cat: 'Bedroom', mrp: 1599, selling: 1399, desc: 'Comfortable queen bed with padded headboard.', stock: 7, material: 'Pine Wood', color: 'White', size: 'Queen', featured: 0 },
        { name: 'Solace Bedside Pair', cat: 'Bedroom', mrp: 499, selling: 449, desc: 'Pair of matching bedside tables with drawer storage.', stock: 20, material: 'MDF', color: 'Oak', size: 'Small', featured: 0 },
        { name: 'Grace Six Drawer Set', cat: 'Bedroom', mrp: 899, selling: 799, desc: 'Six drawer chest for ample clothing storage.', stock: 14, material: 'Solid Wood', color: 'White', size: 'Medium', featured: 0 },
        // --- DINING PRODUCTS ---
        { name: 'Haven Dining Table', cat: 'Dining', mrp: 1799, selling: 1599, desc: 'Solid wood dining table seats six comfortably.', stock: 9, material: 'Solid Oak', color: 'Natural', size: 'Large', featured: 1 },
        { name: 'Oak Dining Chair', cat: 'Dining', mrp: 349, selling: 299, desc: 'Elegant dining chair with cushioned seat.', stock: 30, material: 'Oak Wood', color: 'Natural', size: 'Medium', featured: 0 },
        { name: 'Gathering Table Set', cat: 'Dining', mrp: 2299, selling: 1999, desc: 'Complete dining set with table and six chairs.', stock: 4, material: 'Solid Wood', color: 'Walnut', size: 'Large', featured: 1 },
        { name: 'Arden Sideboard', cat: 'Dining', mrp: 1199, selling: 1049, desc: 'Modern sideboard with cabinet and drawer storage.', stock: 6, material: 'MDF Oak Veneer', color: 'Oak', size: 'Large', featured: 0 },
      ];

      // Insert each product into the database
      for (const p of sampleProducts) {
        // Look up the category ID from the category name
        const [catRow] = await pool.execute('SELECT id FROM categories WHERE name = ?', [p.cat]);
        const catId = catRow.length > 0 ? catRow[0].id : null;
        
        // Insert product with empty images array (JSON format)
        await pool.execute(
          'INSERT INTO products (name, category_id, mrp, selling_price, description, stock, material, color, size, featured, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [p.name, catId, p.mrp, p.selling, p.desc, p.stock, p.material, p.color, p.size, p.featured, JSON.stringify([])]
        );
      }
      console.log('Sample products created');
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
