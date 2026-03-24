export interface ESDocument {
  "@timestamp": string;
  "@version"?: string;
  logdate: string;
  station: string;
  tagId: string;
  value: number;
  quality_flag: number;
}

export interface SensorDataEntry {
  meaning: string;
  data: ESDocument;
  date: Date;
}

export type SensorData = Record<string, SensorDataEntry>;
