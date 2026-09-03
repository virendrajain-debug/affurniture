// ============================================================
// Products API Routes
// ============================================================
// Handles all product operations:
//   GET    /api/products       - List products (with filters)
//   GET    /api/products/:id   - Get single product by ID
//   POST   /api/products       - Create new product (protected)
//   PUT    /api/products/:id   - Update product (protected)
//   DELETE /api/products/:id   - Delete product (protected)
//
// QUERY PARAMETERS for GET /api/products:
//   ?category=Living Room    - Filter by category name
//   ?search=sofa             - Search in name and description
//   ?featured=true           - Only featured products
//   ?new_arrival=true        - Only new arrivals
//   ?limit=4                 - Limit number of results
// ============================================================

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';      // For handling file uploads
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import BACKEND_URL from '../helpers/backendUrl.js';

function resolveImageUrl(img) {
  if (!img) return img;
  if (img.startsWith('http')) return img;
  return `${BACKEND_URL}${img}`;
}

function resolveImages(images) {
  if (!images) return images;
  if (Array.isArray(images)) return images.map(resolveImageUrl);
  return images;
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

const router = Router();

// -----------------------------------------------------------
// GET /api/products
// -----------------------------------------------------------
// List all products with optional filters.
// This is a PUBLIC endpoint (no auth required) for the website.
//
// EXAMPLES:
//   GET /api/products                          - All products
//   GET /api/products?category=Bedroom         - Bedroom products only
//   GET /api/products?featured=true            - Featured products only
//   GET /api/products?search=table             - Search for "table"
//   GET /api/products?limit=4                  - Only 4 products
// -----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, new_arrival, limit, on_sale, subcategory, subcategory_id } = req.query;
    
    // Build query dynamically based on filters
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    // Filter by category name
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }

    // Filter by subcategory_id (from database)
    if (subcategory_id) {
      query += ' AND p.subcategory_id = ?';
      params.push(subcategory_id);
    }

    // Filter by subcategory (match product name using keyword mapping)
    if (subcategory) {
      const subKeywords = {
        'sofas': ['sofa', 'sofas', 'lounge'],
        'armchairs': ['armchair', 'armchairs', 'chair'],
        'coffee-tables': ['coffee table', 'coffee tables'],
        'bed-frames': ['bed frame', 'bed frames', 'bed'],
        'mattresses': ['mattress', 'mattresses'],
        'bedroom-sets': ['bedroom set', 'bedroom sets', 'bedroom suite'],
        'dining-suites': ['dining suite', 'dining suites', 'dining set'],
        'dining-tables': ['dining table', 'dining tables'],
        'dining-chairs': ['dining chair', 'dining chairs'],
        'console-tables': ['console table', 'console tables'],
        'bar-stools': ['bar stool', 'bar stools', 'stool'],
      };
      const keywords = subKeywords[subcategory] || [subcategory.replace(/-/g, ' ')];
      const likeClauses = keywords.map(() => 'LOWER(p.name) LIKE ?').join(' OR ');
      query += ` AND (${likeClauses})`;
      keywords.forEach(kw => params.push(`%${kw}%`));
    }
    
    // Search in product name and description
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Filter featured products only
    if (featured === 'true') {
      query += ' AND p.featured = 1';
    }
    
    // Filter new arrivals only
    if (new_arrival === 'true') {
      query += ' AND p.new_arrival = 1';
    }

    // Filter on-sale products (have discounted price)
    if (on_sale === 'true') {
      query += " AND (p.on_sale = 1 OR (p.discounted_price IS NOT NULL AND p.discounted_price > 0 AND p.discounted_price < p.mrp) OR (p.selling_price IS NOT NULL AND p.selling_price > 0 AND p.selling_price < p.mrp))";
    }

    query += ' ORDER BY p.created_at DESC';
    
    // Pagination (only when page param is provided)
    const page = parseInt(req.query.page);
    const usePagination = !isNaN(page);
    const perPage = parseInt(req.query.per_page) || 12;
    const offset = (usePagination ? (page - 1) * perPage : 0);

    // Get total count for pagination
    let totalProducts = 0;
    let totalPages = 0;
    if (usePagination) {
      let countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
      const countParams = [];
      if (category) { countQuery += ' AND c.name = ?'; countParams.push(category); }
      if (subcategory) {
        const subKeywords = { 'sofas': ['sofa','sofas','lounge'], 'armchairs': ['armchair','armchairs','chair'], 'coffee-tables': ['coffee table','coffee tables'], 'bed-frames': ['bed frame','bed frames','bed'], 'mattresses': ['mattress','mattresses'], 'bedroom-sets': ['bedroom set','bedroom sets','bedroom suite'], 'dining-suites': ['dining suite','dining suites','dining set'], 'dining-tables': ['dining table','dining tables'], 'dining-chairs': ['dining chair','dining chairs'], 'console-tables': ['console table','console tables'], 'bar-stools': ['bar stool','bar stools','stool'] };
        const keywords = subKeywords[subcategory] || [subcategory.replace(/-/g, ' ')];
        const likeClauses = keywords.map(() => 'LOWER(p.name) LIKE ?').join(' OR ');
        countQuery += ` AND (${likeClauses})`;
        keywords.forEach(kw => countParams.push(`%${kw}%`));
      }
      if (search) { countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
      if (featured === 'true') { countQuery += ' AND p.featured = 1'; }
      if (new_arrival === 'true') { countQuery += ' AND p.new_arrival = 1'; }
      if (on_sale === 'true') { countQuery += " AND (p.on_sale = 1 OR (p.discounted_price IS NOT NULL AND p.discounted_price > 0 AND p.discounted_price < p.mrp) OR (p.selling_price IS NOT NULL AND p.selling_price > 0 AND p.selling_price < p.mrp))"; }
      const [countResult] = await pool.execute(countQuery, countParams);
      totalProducts = countResult[0].total;
      totalPages = Math.ceil(totalProducts / perPage);
    }

    // Limit number of results
    if (usePagination) {
      query += ' LIMIT ? OFFSET ?';
      params.push(perPage, offset);
    } else if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const [products] = await pool.execute(query, params);
    
    // Parse images JSON string into JavaScript array and resolve URLs
    const parsed = products.map(p => ({
      ...p,
      images: resolveImages(typeof p.images === 'string' ? JSON.parse(p.images) : p.images)
    }));

    if (usePagination) {
      res.json({
        products: parsed,
        pagination: {
          page,
          per_page: perPage,
          total: totalProducts,
          total_pages: totalPages
        }
      });
    } else {
      res.json(parsed);
    }
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// GET /api/products/by-slug/:slug
// -----------------------------------------------------------
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = ?`,
      [req.params.slug]
    );
    if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
    const product = products[0];
    product.images = resolveImages(typeof product.images === 'string' ? JSON.parse(product.images) : product.images);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// GET /api/products/:id
// -----------------------------------------------------------
// Get a single product by its ID.
//
// EXAMPLE: GET /api/products/5
// -----------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
    
    const product = products[0];
    product.images = resolveImages(typeof product.images === 'string' ? JSON.parse(product.images) : product.images);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// POST /api/products
// -----------------------------------------------------------
// Create a new product. REQUIRES AUTHENTICATION.
//
// HEADERS: Authorization: Bearer <token>
// BODY (multipart/form-data for image uploads):
//   name, category_id, mrp, selling_price, discounted_price,
//   description, stock, material, color, size, dimensions,
//   weight, warranty, delivery_info, featured, new_arrival
//   images (file uploads)
// -----------------------------------------------------------
router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const {
      name, category_id, subcategory_id, mrp, selling_price, discounted_price, description,
      stock, material, color, size, dimensions, weight, warranty, delivery_info,
      featured, new_arrival, brand
    } = req.body;

    // Validate required fields
    if (!name || !mrp) {
      return res.status(400).json({ message: 'Name and MRP are required' });
    }

    // Generate slug from name + category prefix
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    if (category_id) {
      const [catRows] = await pool.execute('SELECT name FROM categories WHERE id = ?', [category_id]);
      if (catRows.length > 0) {
        const catPrefix = catRows[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        slug = `${catPrefix}-${baseSlug}`;
      }
    }
    // Check for slug duplicates
    const [slugCheck] = await pool.execute('SELECT id FROM products WHERE slug = ?', [slug]);
    if (slugCheck.length > 0) {
      let suffix = 2;
      while (true) {
        const testSlug = `${slug}-${suffix}`;
        const [dup] = await pool.execute('SELECT id FROM products WHERE slug = ?', [testSlug]);
        if (dup.length === 0) { slug = testSlug; break; }
        suffix++;
      }
    }

    // Convert uploaded files to URL paths
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    // Insert product into database
    const [result] = await pool.execute(
      `INSERT INTO products (name, category_id, subcategory_id, mrp, selling_price, discounted_price, description, stock, material, color, size, dimensions, weight, warranty, delivery_info, featured, new_arrival, images, slug, brand) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id || null, subcategory_id || null, mrp, selling_price || null, discounted_price || null, description || null, stock || 0, material || null, color || null, size || null, dimensions || null, weight || null, warranty || null, delivery_info || null, featured === 'true' || featured === true ? 1 : 0, new_arrival === 'true' || new_arrival === true ? 1 : 0, JSON.stringify(images), slug, brand || null]
    );

    res.status(201).json({ message: 'Product created successfully', id: result.insertId, slug });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/products/:id
// -----------------------------------------------------------
// Update an existing product. REQUIRES AUTHENTICATION.
// -----------------------------------------------------------
router.put('/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const {
      name, category_id, subcategory_id, mrp, selling_price, discounted_price, description,
      stock, material, color, size, dimensions, weight, warranty, delivery_info,
      featured, new_arrival, existing_images, brand
    } = req.body;

    // Combine existing images with newly uploaded ones
    let images = existing_images ? JSON.parse(existing_images) : [];
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map(f => `/uploads/${f.filename}`)];
    }

    // Generate slug if name or category changed
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slug = baseSlug;
    if (category_id) {
      const [catRows] = await pool.execute('SELECT name FROM categories WHERE id = ?', [category_id]);
      if (catRows.length > 0) {
        const catPrefix = catRows[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        slug = `${catPrefix}-${baseSlug}`;
      }
    }
    const [slugCheck] = await pool.execute('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, req.params.id]);
    if (slugCheck.length > 0) {
      let suffix = 2;
      while (true) {
        const testSlug = `${slug}-${suffix}`;
        const [dup] = await pool.execute('SELECT id FROM products WHERE slug = ? AND id != ?', [testSlug, req.params.id]);
        if (dup.length === 0) { slug = testSlug; break; }
        suffix++;
      }
    }

    await pool.execute(
      `UPDATE products SET name=?, category_id=?, subcategory_id=?, mrp=?, selling_price=?, discounted_price=?, description=?, stock=?, material=?, color=?, size=?, dimensions=?, weight=?, warranty=?, delivery_info=?, featured=?, new_arrival=?, images=?, slug=?, brand=? WHERE id=?`,
      [name, category_id || null, subcategory_id || null, mrp, selling_price || null, discounted_price || null, description || null, stock || 0, material || null, color || null, size || null, dimensions || null, weight || null, warranty || null, delivery_info || null, featured === 'true' || featured === true ? 1 : 0, new_arrival === 'true' || new_arrival === true ? 1 : 0, JSON.stringify(images), slug, brand || null, req.params.id]
    );

    res.json({ message: 'Product updated successfully', slug });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// DELETE /api/products/:id
// -----------------------------------------------------------
// Delete a product by ID. REQUIRES AUTHENTICATION.
// -----------------------------------------------------------
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
