import type { Settings } from "@wors/shared/settings";

export const STATION = "TEST";

export function windVectorDashboard(): Settings {
  return {
    dashboard: {
      station: STATION,
      sensors: { [STATION]: { WD: "풍향", WS: "풍속" } },
      sensorCards: [
        {
          type: "vector",
          title: "바람",
          preparing: false,
          directionSensorId: "WD",
          scaleSensorId: "WS",
          unit: "m/s",
          variant: "wind",
          directionSuffix: "",
        },
      ],
      youtubeEmbeds: [],
    },
  };
}

export function tempScalarDashboard(): Settings {
  return {
    dashboard: {
      station: STATION,
      sensors: { [STATION]: { TEMP: "온도" } },
      sensorCards: [
        { type: "scalar", title: "온도", preparing: false, sensorId: "TEMP", unit: "°C" },
      ],
      youtubeEmbeds: [],
    },
  };
}

export function preparingScalarDashboard(): Settings {
  return {
    dashboard: {
      station: STATION,
      sensors: { [STATION]: { TEMP: "온도" } },
      sensorCards: [
        { type: "scalar", title: "준비중", preparing: true, sensorId: "TEMP", unit: "°C" },
      ],
      youtubeEmbeds: [],
    },
  };
}

export function orphanDashboard(): Settings {
  return {
    dashboard: {
      station: STATION,
      sensors: { [STATION]: { ORPHAN: "미바인딩" } },
      sensorCards: [],
      youtubeEmbeds: [],
    },
  };
}
