import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

const pool = {
  execute(sql, params = []) {
    const trimmed = sql.trim().replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const upper = trimmed.toUpperCase();

    if (upper.startsWith('SELECT') || upper.startsWith('SHOW') || upper.startsWith('PRAGMA')) {
      const stmt = db.prepare(trimmed);
      if (params.length > 0) stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return [rows, []];
    }

    if (upper.startsWith('INSERT')) {
      db.run(trimmed, params);
      const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0] || 0;
      save();
      return [{ insertId: Number(id), affectedRows: db.getRowsModified() }, []];
    }

    db.run(trimmed, params);
    save();
    return [{ affectedRows: db.getRowsModified() }, []];
  }
};

const SQL = await initSqlJs();

if (fs.existsSync(DB_PATH)) {
  const buffer = fs.readFileSync(DB_PATH);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA foreign_keys = ON');

export default pool;
