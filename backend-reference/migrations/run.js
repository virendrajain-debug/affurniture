// ============================================================
// MySQL Database Migration Script
// ============================================================
// This script creates all the database tables needed for the app.
// Run it once when setting up the project: npm run migrate
//
// TABLES CREATED:
//   - users: Admin accounts (login, profile)
//   - categories: Product categories (Living Room, Bedroom, etc.)
//   - products: All furniture products
//   - enquiries: Customer enquiry/interest forms
//   - about: Company information for the About page
//   - terms: Terms & Conditions content
//
// All tables use IF NOT EXISTS so running this multiple times is safe.
// ============================================================

import pool from '../config/db.js'; // Import the database connection pool

// SQL statements to create all tables
const migrations = `
  /* ---- USERS TABLE ---- */
  /* Stores admin account info. Default admin: admin@gmail.com / admin123 */
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,          /* Unique user ID */
    name VARCHAR(255) NOT NULL DEFAULT 'Admin', /* Display name */
    email VARCHAR(255) NOT NULL UNIQUE,         /* Login email (unique) */
    password VARCHAR(255) NOT NULL,             /* Bcrypt hashed password */
    profile_image TEXT,                         /* Profile photo (base64 or URL) */
    role ENUM('admin', 'user') DEFAULT 'admin', /* User role */
    otp VARCHAR(10),                            /* One-time password for reset */
    otp_expires_at DATETIME,                    /* When the OTP expires */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

  /* ---- CATEGORIES TABLE ---- */
  /* Product categories like Living Room, Bedroom, Dining, etc. */
  CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,          /* Category name (unique) */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  /* ---- PRODUCTS TABLE ---- */
  /* All furniture products listed on the website */
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,                 /* Product name */
    category_id INT,                            /* Links to categories table */
    mrp DECIMAL(10,2) NOT NULL,                /* Maximum Retail Price */
    selling_price DECIMAL(10,2),                /* Current selling price */
    discounted_price DECIMAL(10,2),             /* Special discounted price */
    description TEXT,                           /* Product description */
    stock INT DEFAULT 0,                        /* How many in stock (0 = out of stock) */
    material VARCHAR(255),                      /* e.g., "Solid Oak Wood" */
    color VARCHAR(255),                         /* e.g., "Walnut Brown" */
    size VARCHAR(100),                          /* e.g., "Large", "King" */
    dimensions VARCHAR(255),                    /* e.g., "120cm x 80cm x 75cm" */
    weight DECIMAL(8,2),                        /* Weight in kg */
    warranty VARCHAR(255),                      /* e.g., "1 Year Manufacturer Warranty" */
    delivery_info VARCHAR(255),                 /* e.g., "Free delivery in 5-7 days" */
    featured BOOLEAN DEFAULT FALSE,             /* Show in featured section? */
    new_arrival BOOLEAN DEFAULT FALSE,          /* Mark as new arrival? */
    images JSON,                                /* Array of image URLs/paths */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    /* If a category is deleted, products keep their category_id as NULL */
  );

  /* ---- ENQUIRIES TABLE ---- */
  /* Customer interest forms - both product enquiries and contact forms */
  CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,                 /* Customer's name */
    email VARCHAR(255) NOT NULL,                /* Customer's email */
    phone VARCHAR(50),                          /* Customer's phone (optional) */
    product_id INT,                             /* Which product they're enquiring about */
    product_name VARCHAR(255),                  /* Product name (stored for reference) */
    message TEXT,                               /* Customer's message */
    status ENUM('pending', 'replied', 'closed') DEFAULT 'pending',
    type ENUM('product', 'contact') DEFAULT 'product', /* Product enquiry or contact form */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  /* ---- ABOUT TABLE ---- */
  /* Company information displayed on the About section */
  CREATE TABLE IF NOT EXISTS about (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),                  /* e.g., "AF Furnishings" */
    tagline VARCHAR(500),                       /* e.g., "Comfort made for everyday living." */
    description TEXT,                           /* Full company description */
    address TEXT,                               /* Company address */
    phone VARCHAR(50),                          /* Contact phone */
    email VARCHAR(255),                         /* Contact email */
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

  /* ---- TERMS TABLE ---- */
  /* Terms & Conditions content for the website */
  CREATE TABLE IF NOT EXISTS terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content LONGTEXT,                           /* Full T&C text */
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

// Run all migration statements
async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Split the SQL into individual statements and execute each
    const statements = migrations
      .split(';')              // Split by semicolon
      .map(s => s.trim())      // Remove whitespace
      .filter(s => s.length > 0); // Skip empty statements
    
    for (const statement of statements) {
      await pool.execute(statement); // Execute each CREATE TABLE statement
    }
    
    console.log('Migrations completed successfully!');
    process.exit(0); // Exit with success code
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1); // Exit with error code
  }
}

runMigrations();
