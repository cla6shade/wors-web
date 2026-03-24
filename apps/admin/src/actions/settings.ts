"use server";

import { revalidatePath } from "next/cache";
import { readSettings, writeSettings } from "@wors/shared/settings";
import type {
  SensorMap,
  SensorCardConfig,
  YouTubeEmbedConfig,
  DashboardConfig,
} from "@wors/shared/settings";
import { verifySession } from "@/lib/auth";

async function requireAuth() {
  if (!(await verifySession())) {
    throw new Error("Unauthorized");
  }
}

function ensureDashboard(): DashboardConfig {
  const settings = readSettings();
  return settings.dashboard ?? {
    station: "",
    sensors: {},
    sensorCards: [],
    youtubeEmbeds: [],
  };
}

export async function saveGeneral(data: {
  title: string;
  station: string;
  refreshIntervalMin: number;
  pageRefreshIntervalMin: number;
}): Promise<{ error?: string }> {
  await requireAuth();
  try {
    const dashboard = ensureDashboard();
    dashboard.title = data.title || undefined;
    dashboard.station = data.station;
    dashboard.refreshIntervalMin = data.refreshIntervalMin > 0 ? data.refreshIntervalMin : undefined;
    dashboard.pageRefreshIntervalMin = data.pageRefreshIntervalMin > 0 ? data.pageRefreshIntervalMin : undefined;
    writeSettings({ dashboard });
    revalidatePath("/");
    return {};
  } catch {
    return { error: "저장에 실패했습니다." };
  }
}

export async function saveSensors(
  sensors: SensorMap,
): Promise<{ error?: string }> {
  await requireAuth();
  try {
    const dashboard = ensureDashboard();
    dashboard.sensors = sensors;
    writeSettings({ dashboard });
    revalidatePath("/");
    return {};
  } catch {
    return { error: "저장에 실패했습니다." };
  }
}

export async function saveSensorCards(
  cards: SensorCardConfig[],
): Promise<{ error?: string }> {
  await requireAuth();
  try {
    const dashboard = ensureDashboard();
    dashboard.sensorCards = cards;
    writeSettings({ dashboard });
    revalidatePath("/");
    return {};
  } catch {
    return { error: "저장에 실패했습니다." };
  }
}

export async function saveYoutubeEmbeds(
  embeds: YouTubeEmbedConfig[],
): Promise<{ error?: string }> {
  await requireAuth();
  try {
    const dashboard = ensureDashboard();
    dashboard.youtubeEmbeds = embeds;
    writeSettings({ dashboard });
    revalidatePath("/");
    return {};
  } catch {
    return { error: "저장에 실패했습니다." };
  }
}
