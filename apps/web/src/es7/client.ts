import "server-only";

import { Client } from "@opensearch-project/opensearch";

export const esClient = new Client({
  node: process.env.ES7_HOST,
  auth: {
    username: process.env.ES7_USERNAME!,
    password: process.env.ES7_PASSWORD!,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});
