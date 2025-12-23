
import { Counter, CounterEntry } from './types';
import { INITIAL_DATA } from './constants';

declare global {
  interface Window {
    initSqlJs: any;
  }
}

let db: any;

function uint8ArrayToBase64(u8: Uint8Array): string {
  let binary = '';
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8[i] = binary.charCodeAt(i);
  }
  return u8;
}

export async function initDB() {
  if (!window.initSqlJs) {
    throw new Error("initSqlJs is not loaded. Ensure the script tag is present in index.html");
  }

  const SQL = await window.initSqlJs({
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

  db.run(`
    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      name TEXT,
      unit TEXT,
      color TEXT,
      tags TEXT,
      initialCount INTEGER,
      goal INTEGER,
      createdAt INTEGER,
      icon TEXT,
      iconType TEXT DEFAULT 'icon'
    );
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      counterId TEXT,
      timestamp INTEGER,
      value INTEGER
    );
  `);

  // Handle simple column migration for existing databases
  try {
    db.run("ALTER TABLE counters ADD COLUMN icon TEXT");
  } catch(e) {}
  try {
    db.run("ALTER TABLE counters ADD COLUMN iconType TEXT DEFAULT 'icon'");
  } catch(e) {}

  const res = db.exec("SELECT COUNT(*) FROM counters");
  const count = res[0].values[0][0];
  if (count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const stmtCounter = db.prepare("INSERT INTO counters VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const stmtEntry = db.prepare("INSERT INTO entries VALUES (?, ?, ?, ?)");

  INITIAL_DATA.counters.forEach(c => {
    stmtCounter.run([
      c.id, 
      c.name, 
      c.unit, 
      c.color, 
      JSON.stringify(c.tags), 
      c.initialCount, 
      c.goal || null, 
      c.createdAt,
      (c as any).icon || 'fa-solid fa-star',
      (c as any).iconType || 'icon'
    ]);
  });

  INITIAL_DATA.entries.forEach(e => {
    stmtEntry.run([e.id, e.counterId, e.timestamp, e.value]);
  });

  stmtCounter.free();
  stmtEntry.free();
  persist();
}

function persist() {
  if (!db) return;
  const data = db.export();
  const base64 = uint8ArrayToBase64(data);
  localStorage.setItem('quantify_sqlite_db', base64);
}

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
    createdAt: row[7],
    icon: row[8],
    iconType: (row[9] as 'icon' | 'image') || 'icon'
  }));
}

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

export function addCounter(c: Counter) {
  db.run("INSERT INTO counters VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    c.id, c.name, c.unit, c.color, JSON.stringify(c.tags), c.initialCount, c.goal || null, c.createdAt, c.icon, c.iconType
  ]);
  persist();
}

export function updateCounter(c: Counter) {
  db.run("UPDATE counters SET name=?, unit=?, color=?, tags=?, initialCount=?, goal=?, icon=?, iconType=? WHERE id=?", [
    c.name, c.unit, c.color, JSON.stringify(c.tags), c.initialCount, c.goal || null, c.icon, c.iconType, c.id
  ]);
  persist();
}

export function deleteCounter(id: string) {
  db.run("DELETE FROM counters WHERE id = ?", [id]);
  db.run("DELETE FROM entries WHERE counterId = ?", [id]);
  persist();
}

export function addEntry(e: CounterEntry) {
  db.run("INSERT INTO entries VALUES (?, ?, ?, ?)", [e.id, e.counterId, e.timestamp, e.value]);
  persist();
}

export function clearEntries(counterId: string) {
  db.run("DELETE FROM entries WHERE counterId = ?", [counterId]);
  persist();
}

export function getUniqueTags(): string[] {
  const counters = getAllCounters();
  const tags = new Set<string>();
  counters.forEach(c => c.tags.forEach(t => tags.add(t)));
  return Array.from(tags);
}
