import { vi } from "vitest";
import type { Client } from "@opensearch-project/opensearch";
import type { ESDocument } from "../types";
import { STATION } from "./fixtures";

type MustClause = {
  match?: { station?: string };
  match_phrase?: { tagId?: string };
  range?: { logdate?: { gte?: string; lte?: string; lt?: string } };
};

export type SearchArg = { body: { query: { bool: { must: MustClause[] } } } };

function tagIdFromBody(body: SearchArg["body"]): string {
  const phrase = body.query.bool.must.find((m) => m.match_phrase?.tagId);
  return phrase?.match_phrase?.tagId ?? "";
}

function beforeLogdateFromBody(body: SearchArg["body"]): string | undefined {
  const range = body.query.bool.must.find((m) => m.range?.logdate);
  return range?.range?.logdate?.lt;
}

export function doc(overrides: Partial<ESDocument> & { tagId: string }): ESDocument {
  return {
    "@timestamp": overrides.logdate ?? "2026-01-01T00:00:00Z",
    logdate: "2026-01-01T00:00:00Z",
    station: STATION,
    value: 1,
    quality_flag: 0,
    ...overrides,
  };
}

export type SearchHandler = (
  tagId: string,
  beforeLogdate: string | undefined,
) => ESDocument | null;

export function buildClient(handler: SearchHandler): Client {
  const search = vi.fn(async (arg: SearchArg) => {
    const tagId = tagIdFromBody(arg.body);
    const before = beforeLogdateFromBody(arg.body);
    const result = handler(tagId, before);
    return {
      body: {
        hits: { hits: result ? [{ _source: result }] : [] },
      },
    };
  });
  return { search } as unknown as Client;
}
