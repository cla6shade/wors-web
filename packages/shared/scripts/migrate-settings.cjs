/**
 * settings.json -> settings.sqlite3 마이그레이션 스크립트
 *
 * Usage: node packages/shared/scripts/migrate-settings.cjs
 */
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../..");
const jsonPath = path.join(root, "settings.json");
const dbPath = path.join(root, "settings.sqlite3");

if (!fs.existsSync(jsonPath)) {
  console.error("settings.json not found at", jsonPath);
  process.exit(1);
}

const data = fs.readFileSync(jsonPath, "utf-8");
JSON.parse(data); // validate JSON

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(
  `CREATE TABLE IF NOT EXISTS settings (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL
   )`
);
db.prepare(
  `INSERT INTO settings (key, value) VALUES (?, ?)
   ON CONFLICT(key) DO UPDATE SET value = excluded.value`
).run("settings", data.trim());
db.close();

console.log("Migrated settings.json -> settings.sqlite3");
