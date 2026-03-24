import "server-only";

import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function findMonorepoRoot(startDir: string): string {
  let dir = startDir;
  while (true) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) return startDir;
    dir = parent;
  }
}

const DB_PATH = resolve(findMonorepoRoot(process.cwd()), "visitors.sqlite3");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(`
      CREATE TABLE IF NOT EXISTS visits (
        date TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      )
    `);
  }
  return _db;
}

/** Record a visit for a given date (YYYY-MM-DD). Defaults to today in KST. */
export function recordVisit(date?: string): void {
  const db = getDb();
  const d = date ?? toKstDateString();
  db.prepare(
    `INSERT INTO visits (date, count) VALUES (?, 1)
     ON CONFLICT(date) DO UPDATE SET count = count + 1`
  ).run(d);
}

export type DailyVisits = { date: string; count: number };

/** KST 기준 YYYY-MM-DD */
function toKstDateString(d: Date = new Date()): string {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Get daily visit counts for the last N days (default 30). */
export function getVisits(days = 30): DailyVisits[] {
  const db = getDb();
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  const sinceStr = toKstDateString(since);

  return db
    .prepare(
      `SELECT date, count FROM visits WHERE date >= ? ORDER BY date ASC`
    )
    .all(sinceStr) as DailyVisits[];
}

/** Get today's visit count. */
export function getTodayVisits(): number {
  const db = getDb();
  const row = db
    .prepare(`SELECT count FROM visits WHERE date = ?`)
    .get(toKstDateString()) as { count: number } | undefined;
  return row?.count ?? 0;
}

/** Get this month's total visit count. */
export function getMonthlyVisits(): number {
  const db = getDb();
  const row = db
    .prepare(`SELECT COALESCE(SUM(count), 0) AS total FROM visits WHERE date LIKE ?`)
    .get(`${toKstDateString().slice(0, 7)}%`) as { total: number };
  return row.total;
}

export type MonthlyVisits = { month: string; count: number };

/** Get monthly visit totals for the last N months (default 12). */
export function getMonthlyVisitHistory(months = 12): MonthlyVisits[] {
  const db = getDb();
  const since = new Date();
  since.setMonth(since.getMonth() - months + 1);
  since.setDate(1);
  const sinceStr = toKstDateString(since);

  return db
    .prepare(
      `SELECT substr(date, 1, 7) AS month, SUM(count) AS count
       FROM visits WHERE date >= ? GROUP BY month ORDER BY month ASC`
    )
    .all(sinceStr) as MonthlyVisits[];
}
