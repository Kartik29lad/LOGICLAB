import { ALGORITHM_CATALOG } from "../../../core/algorithms/catalog";
import { DATA_STRUCTURE_METADATA } from "../../../core/data-structures/metadata";
import { NotFoundError } from "../../../errors";
import { apiCache } from "../../api/cache/memory-cache";

const CONTENT_CACHE_VERSION = "v2";
const CACHE_TTL = 5 * 60_000;

export function listAlgorithms() {
  const key = `content:algorithms:${CONTENT_CACHE_VERSION}`;
  const cached = apiCache.get<unknown[]>(key);
  if (cached) return cached;
  const items = Object.values(ALGORITHM_CATALOG).map(({ metadata }) => ({ ...metadata }));
  apiCache.set(key, items, CACHE_TTL);
  return items;
}

export function getAlgorithm(slug: string) {
  const key = `content:algorithm:${slug}:${CONTENT_CACHE_VERSION}`;
  const cached = apiCache.get<Record<string, unknown>>(key);
  if (cached) return cached;
  const entry = ALGORITHM_CATALOG[slug as keyof typeof ALGORITHM_CATALOG];
  if (!entry) throw new NotFoundError("Algorithm not found.");
  const result = { metadata: entry.metadata };
  apiCache.set(key, result, CACHE_TTL);
  return result;
}

export function listDataStructures() {
  const key = `content:data-structures:${CONTENT_CACHE_VERSION}`;
  const cached = apiCache.get<unknown[]>(key);
  if (cached) return cached;
  const items = DATA_STRUCTURE_METADATA.map((item) => ({ ...item }));
  apiCache.set(key, items, CACHE_TTL);
  return items;
}

export function getDataStructure(slug: string) {
  const key = `content:data-structure:${slug}:${CONTENT_CACHE_VERSION}`;
  const cached = apiCache.get<Record<string, unknown>>(key);
  if (cached) return cached;
  const item = DATA_STRUCTURE_METADATA.find((entry) => entry.id === slug);
  if (!item) throw new NotFoundError("Data structure not found.");
  const result = { metadata: item };
  apiCache.set(key, result, CACHE_TTL);
  return result;
}
