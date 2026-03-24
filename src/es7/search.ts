import { Client } from "@opensearch-project/opensearch";
import { ESDocument, SensorData } from "./types";
import { unstable_noStore as noStore } from "next/cache";
import sensorsData from "../../sensors.json";

export async function getLatestSensorData(
  client: Client,
  station: string,
  tagId: string,
  filter20min: boolean = false
): Promise<ESDocument | null> {
  const must: Record<string, unknown>[] = [
    { match: { station: station } },
    { match_phrase: { tagId: tagId } },
    {
      range: {
        logdate: {
          gte: "now-1d/d",
          lte: "now+1d/d",
        },
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

export async function getAllSensorData(client: Client, station: string): Promise<SensorData> {
  const sensors = sensorsData as unknown as Record<string, Record<string, string>>;
  const stationSensors = sensors[station];

  if (!stationSensors) {
    console.error(`Station ${station} not found in sensors.json`);
    return {};
  }

  const promises = Object.entries(stationSensors).map(
    async ([tagId, meaning]: [string, string]) => {
      const isWaveHeight = meaning.includes("파고");
      const data = await getLatestSensorData(
        client,
        station,
        tagId,
        isWaveHeight
      );
      return { tagId, meaning, data };
    }
  );

  const results = await Promise.all(promises);

  const formattedResults: SensorData = {};
  results.forEach((item) => {
    if (item.data) {
      formattedResults[item.tagId] = {
        meaning: item.meaning,
        data: item.data,
        date: new Date(item.data['@timestamp']),
      };
    }
  });

  return formattedResults;
}
