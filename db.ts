
import { Counter, CounterEntry } from './types';
import { INITIAL_DATA } from './constants';

// Declare the global initSqlJs function provided by the script tag in index.html
declare global {
  interface Window {
    initSqlJs: any;
  }
}

let db: any;

/**
 * Utility to convert Uint8Array to Base64 string for storage in LocalStorage
 */
function uint8ArrayToBase64(u8: Uint8Array): string {
  let binary = '';
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary);
}

/**
 * Utility to convert Base64 string to Uint8Array for database loading
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8[i] = binary.charCodeAt(i);
  }
  return u8;
}

/**
 * Initialize the SQLite database, load existing data, or seed initial data
 */
export async function initDB() {
  // Use the global initSqlJs from the script tag instead of an ES6 import
  // to explicitly avoid Node-specific environment detection which causes 'fs' errors.
  if (!window.initSqlJs) {
    throw new Error("initSqlJs is not loaded. Ensure the script tag is present in index.html");
  }

  const SQL = await window.initSqlJs({
    // Locate the WASM file from the same CDN to ensure matching versions
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
  });

  const saved = localStorage.getItem('quantify_sqlite_db');
  if (saved) {
    try {
      db = new SQL.Database(base64ToUint8Array(saved));
    } catch (e) {
      console.error("Failed to load saved database, starting fresh", e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Ensure tables exist
  db.run(`
    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      name TEXT,
      unit TEXT,
      color TEXT,
      tags TEXT,
      initialCount INTEGER,
      goal INTEGER,
      createdAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      counterId TEXT,
      timestamp INTEGER,
      value INTEGER
    );
  `);

  // Seed initial data if the database is brand new
  const res = db.exec("SELECT COUNT(*) FROM counters");
  const count = res[0].values[0][0];
  if (count === 0) {
    seedInitialData();
  }
}

/**
 * Seeds the database with provided initial data constants
 */
function seedInitialData() {
  const stmtCounter = db.prepare("INSERT INTO counters VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  const stmtEntry = db.prepare("INSERT INTO entries VALUES (?, ?, ?, ?)");

  INITIAL_DATA.counters.forEach(c => {
    stmtCounter.run([c.id, c.name, c.unit, c.color, JSON.stringify(c.tags), c.initialCount, c.goal || null, c.createdAt]);
  });

  INITIAL_DATA.entries.forEach(e => {
    stmtEntry.run([e.id, e.counterId, e.timestamp, e.value]);
  });

  stmtCounter.free();
  stmtEntry.free();
  persist();
}

/**
 * Saves the current state of the database to localStorage as a Base64 string
 */
function persist() {
  if (!db) return;
  const data = db.export();
  const base64 = uint8ArrayToBase64(data);
  localStorage.setItem('quantify_sqlite_db', base64);
}

/**
 * Fetches all counters from the SQLite store
 */
export function getAllCounters(): Counter[] {
  const res = db.exec("SELECT * FROM counters ORDER BY createdAt DESC");
  if (res.length === 0) return [];
  return res[0].values.map((row: any[]) => ({
    id: row[0],
    name: row[1],
    unit: row[2],
    color: row[3],
    tags: JSON.parse(row[4]),
    initialCount: row[5],
    goal: row[6],
    createdAt: row[7]
  }));
}

/**
 * Fetches all entries from the SQLite store
 */
export function getAllEntries(): CounterEntry[] {
  const res = db.exec("SELECT * FROM entries ORDER BY timestamp ASC");
  if (res.length === 0) return [];
  return res[0].values.map((row: any[]) => ({
    id: row[0],
    counterId: row[1],
    timestamp: row[2],
    value: row[3]
  }));
}

/**
 * Adds a new counter via SQL INSERT
 */
export function addCounter(c: Counter) {
  db.run("INSERT INTO counters VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    c.id, c.name, c.unit, c.color, JSON.stringify(c.tags), c.initialCount, c.goal || null, c.createdAt
  ]);
  persist();
}

/**
 * Deletes a counter and its associated entries via SQL DELETE
 */
export function deleteCounter(id: string) {
  db.run("DELETE FROM counters WHERE id = ?", [id]);
  db.run("DELETE FROM entries WHERE counterId = ?", [id]);
  persist();
}

/**
 * Logs a new increment/decrement entry via SQL INSERT
 */
export function addEntry(e: CounterEntry) {
  db.run("INSERT INTO entries VALUES (?, ?, ?, ?)", [e.id, e.counterId, e.timestamp, e.value]);
  persist();
}

/**
 * Resets a counter by clearing its entry log via SQL DELETE
 */
export function clearEntries(counterId: string) {
  db.run("DELETE FROM entries WHERE counterId = ?", [counterId]);
  persist();
}
