import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;
let saveTimeout = null;

function saveToDisk() {
  if (!db) return;
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (err) {
    console.error('CRITICAL: Failed to save database to disk:', err.message);
  }
}

function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveToDisk, 100);
}

const pool = {
  execute(sql, params = []) {
    const trimmed = sql.trim().replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const upper = trimmed.toUpperCase();

    if (upper.startsWith('SELECT') || upper.startsWith('SHOW') || upper.startsWith('PRAGMA')) {
      try {
        const stmt = db.prepare(trimmed);
        if (params.length > 0) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return [rows, []];
      } catch (err) {
        console.error('SELECT error:', err.message, '\nSQL:', trimmed.substring(0, 200));
        throw err;
      }
    }

    if (upper.startsWith('INSERT')) {
      try {
        db.run(trimmed, params);
        const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0] || 0;
        saveToDisk();
        return [{ insertId: Number(id), affectedRows: db.getRowsModified() }, []];
      } catch (err) {
        console.error('INSERT error:', err.message, '\nSQL:', trimmed.substring(0, 200));
        throw err;
      }
    }

    if (upper.startsWith('UPDATE') || upper.startsWith('DELETE')) {
      try {
        db.run(trimmed, params);
        const affected = db.getRowsModified();
        saveToDisk();
        return [{ affectedRows: affected }, []];
      } catch (err) {
        console.error('WRITE error:', err.message, '\nSQL:', trimmed.substring(0, 200));
        throw err;
      }
    }

    // CREATE TABLE, ALTER TABLE, etc.
    try {
      db.run(trimmed, params);
      return [{ affectedRows: 0 }, []];
    } catch (err) {
      // Silently ignore "column already exists" errors from ALTER TABLE
      if (err.message && err.message.includes('duplicate column')) {
        return [{ affectedRows: 0 }, []];
      }
      console.error('DDL error:', err.message, '\nSQL:', trimmed.substring(0, 200));
      throw err;
    }
  },

  // Batch execute multiple statements in a transaction
  transaction(statements) {
    try {
      db.run('BEGIN TRANSACTION');
      const results = [];
      for (const { sql, params } of statements) {
        results.push(pool.execute(sql, params || []));
      }
      db.run('COMMIT');
      saveToDisk();
      return results;
    } catch (err) {
      db.run('ROLLBACK');
      console.error('Transaction error:', err.message);
      throw err;
    }
  },

  // Raw run for DDL (CREATE TABLE, ALTER TABLE)
  run(sql, params = []) {
    try {
      db.run(sql, params);
      return true;
    } catch (err) {
      if (err.message && err.message.includes('duplicate column')) {
        return true;
      }
      console.error('Run error:', err.message, '\nSQL:', sql.substring(0, 200));
      throw err;
    }
  },

  // Force save to disk
  flush() {
    saveToDisk();
  }
};

const SQL = await initSqlJs();

if (fs.existsSync(DB_PATH)) {
  const buffer = fs.readFileSync(DB_PATH);
  db = new SQL.Database(buffer);
  console.log('Loaded existing database from disk.');
} else {
  db = new SQL.Database();
  console.log('Created new in-memory database.');
}

db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA synchronous = NORMAL');

export default pool;
