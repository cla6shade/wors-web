import "server-only";

import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export type VectorCardConfig = {
  type: "vector";
  title: string;
  preparing: boolean;
  directionSensorId: string;
  scaleSensorId: string;
  unit: string;
  variant: "wind" | "wave" | "current";
  directionSuffix: string;
  reverseDirection?: boolean;
};

export type ScalarCardConfig = {
  type: "scalar";
  title: string;
  preparing: boolean;
  sensorId: string;
  unit: string;
};

export type RangeCardConfig = {
  type: "range";
  title: string;
  preparing: boolean;
  sensorId: string;
  unit: string;
  rangeStart: number;
  rangeEnd: number;
  valueDivisor?: number;
};

export type SensorCardConfig =
  | VectorCardConfig
  | ScalarCardConfig
  | RangeCardConfig;

export type YouTubeEmbedConfig = {
  title: string;
  url: string;
};

export type SensorMap = Record<string, Record<string, string>>;

export type DashboardConfig = {
  title?: string;
  station: string;
  refreshIntervalMin?: number;
  pageRefreshIntervalMin?: number;
  sensors: SensorMap;
  sensorCards: SensorCardConfig[];
  youtubeEmbeds: YouTubeEmbedConfig[];
};

export type Settings = {
  dashboard?: DashboardConfig;
};

function findMonorepoRoot(startDir: string): string {
  let dir = startDir;
  while (true) {
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) return startDir;
    dir = parent;
  }
}

const DB_PATH = resolve(findMonorepoRoot(process.cwd()), "settings.sqlite3");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
  }
  return _db;
}

export function readSettings(): Settings {
  const db = getDb();
  const row = db
    .prepare(`SELECT value FROM settings WHERE key = ?`)
    .get("settings") as { value: string } | undefined;
  if (!row) return {};
  return JSON.parse(row.value) as Settings;
}

export function writeSettings(settings: Settings): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run("settings", JSON.stringify(settings));
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = readSettings();
  const merged = { ...current, ...partial };
  writeSettings(merged);
  return merged;
}
