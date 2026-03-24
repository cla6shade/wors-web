import "server-only";

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export type Settings = Record<string, unknown>;

const SETTINGS_PATH = resolve(process.cwd(), "settings.json");

/**
 * 프로젝트 루트의 settings.json을 읽어 반환합니다.
 * 파일이 없으면 빈 객체를 반환합니다.
 */
export function readSettings(): Settings {
  if (!existsSync(SETTINGS_PATH)) {
    return {};
  }
  const raw = readFileSync(SETTINGS_PATH, "utf-8");
  return JSON.parse(raw) as Settings;
}

/**
 * settings.json에 데이터를 기록합니다.
 * 기존 내용을 완전히 덮어씁니다.
 */
export function writeSettings(settings: Settings): void {
  writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

/**
 * settings.json의 기존 값을 유지하면서 부분 업데이트합니다.
 */
export function updateSettings(partial: Partial<Settings>): Settings {
  const current = readSettings();
  const merged = { ...current, ...partial };
  writeSettings(merged);
  return merged;
}
