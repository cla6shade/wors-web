import "server-only";

import { readFileSync, writeFileSync, existsSync } from "node:fs";
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

const SETTINGS_PATH = resolve(findMonorepoRoot(process.cwd()), "settings.json");

export function readSettings(): Settings {
  if (!existsSync(SETTINGS_PATH)) {
    return {};
  }
  const raw = readFileSync(SETTINGS_PATH, "utf-8");
  return JSON.parse(raw) as Settings;
}

export function writeSettings(settings: Settings): void {
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = readSettings();
  const merged = { ...current, ...partial };
  writeSettings(merged);
  return merged;
}
