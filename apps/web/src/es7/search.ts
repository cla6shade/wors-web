import { Client } from "@opensearch-project/opensearch";
import { ESDocument, SensorData } from "./types";
import { readSettings, SensorCardConfig } from "@wors/shared/settings";

export async function getLatestSensorData(
  client: Client,
  station: string,
  tagId: string,
  filter20min: boolean = false,
  rangeMinutes: number = 30,
  beforeLogdate?: string,
): Promise<ESDocument | null> {
  const logdateRange: Record<string, string> = {
    gte: `now-${rangeMinutes}m`,
  };
  if (beforeLogdate) {
    logdateRange.lt = beforeLogdate;
  } else {
    logdateRange.lte = "now";
  }

  const must: Record<string, unknown>[] = [
    { match: { station: station } },
    { match_phrase: { tagId: tagId } },
    {
      range: {
        logdate: logdateRange,
      },
    },
  ];

  if (filter20min) {
    must.push({
      script: {
        script: {
          source: `
            long epochMillis = doc['logdate'].value.toInstant().toEpochMilli();
            long minutes = (epochMillis / 60000) % 60;
return minutes == 0 || minutes == 20 || minutes == 40;
`,
          lang: "painless",
        },
      },
    });
  }

  const query = {
    size: 1,
    query: {
      bool: {
        must: must,
      },
    },
    sort: [
      {
        logdate: { order: "desc" },
      },
    ],
  };

  // @ts-ignore
  const searchRes = await client.search({
    index: "kiost-*",
    body: query,
  });

  if (searchRes.body.hits.hits.length > 0) {
    return searchRes.body.hits.hits[0]._source as ESDocument;
  }
  return null;
}

type SensorFetchResult = {
  tagId: string;
  meaning: string;
  data: ESDocument | null;
};

function getCardSensorIds(card: SensorCardConfig): string[] {
  if (card.preparing) return [];
  if (card.type === "vector") {
    return [card.directionSensorId, card.scaleSensorId].filter((id) => id !== "");
  }
  return card.sensorId ? [card.sensorId] : [];
}

function needsFallback(data: ESDocument | null | undefined): boolean {
  if (!data) return true;
  const n = Number(data.value);
  return n === 0 || Number.isNaN(n);
}

export async function getAllSensorData(client: Client, station: string): Promise<SensorData> {
  const settings = readSettings();
  const dashboard = settings.dashboard;
  const stationSensors = dashboard?.sensors?.[station];
  const rangeMinutes = dashboard?.refreshIntervalMin ?? 30;

  if (!stationSensors) {
    console.error(`Station ${station} not found in sensors.json`);
    return {};
  }

  const promises = Object.entries(stationSensors).map(
    async ([tagId, meaning]: [string, string]): Promise<SensorFetchResult> => {
      const isWaveHeight = meaning.includes("파고");
      const data = await getLatestSensorData(
        client,
        station,
        tagId,
        isWaveHeight,
        rangeMinutes,
      );
      return { tagId, meaning, data };
    }
  );

  const results = await Promise.all(promises);
  const byTagId = new Map<string, SensorFetchResult>(
    results.map((r) => [r.tagId, r])
  );

  const sensorCards = dashboard?.sensorCards ?? [];
  await Promise.all(
    sensorCards.map(async (card) => {
      const sensorIds = getCardSensorIds(card).filter((id) => byTagId.has(id));
      if (sensorIds.length === 0) return;

      const trigger = sensorIds.some((id) => needsFallback(byTagId.get(id)?.data));
      if (!trigger) return;

      const logdates = sensorIds
        .map((id) => byTagId.get(id)?.data?.logdate)
        .filter((d): d is string => typeof d === "string");
      if (logdates.length === 0) return;
      const T = logdates.reduce((a, b) => (a > b ? a : b));

      await Promise.all(
        sensorIds.map(async (id) => {
          const current = byTagId.get(id);
          if (!current) return;
          const isWaveHeight = current.meaning.includes("파고");
          const fallbackData = await getLatestSensorData(
            client,
            station,
            id,
            isWaveHeight,
            rangeMinutes,
            T,
          );
          if (fallbackData) {
            byTagId.set(id, { ...current, data: fallbackData });
          }
        })
      );
    })
  );

  const formattedResults: SensorData = {};
  for (const item of byTagId.values()) {
    if (item.data) {
      formattedResults[item.tagId] = {
        meaning: item.meaning,
        data: item.data,
        date: new Date(item.data['@timestamp']),
      };
    }
  }

  return formattedResults;
}
