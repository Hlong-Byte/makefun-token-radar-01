// The snapshot out of a file's text, refused unless it is the shape the model scores.
//
// A refused snapshot never becomes a silent default: every message names the field that is wrong, so a
// changed input surfaces as one line rather than as a board of zeros.

import { SnapshotError } from './types.ts';
import type { Snapshot, SnapshotProtocol } from './types.ts';

/** A string, or null: the snapshot's optional text fields. */
function textOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/** A finite number, or null: the snapshot's optional figures. */
function numOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** One protocol, refused unless it carries the three fields the board ranks on. */
function protocolAt(raw: unknown, index: number): SnapshotProtocol {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new SnapshotError(`snapshot.json's protocol ${index} is not an object`);
  }
  const p = raw as Record<string, unknown>;
  if (typeof p.slug !== 'string' || typeof p.name !== 'string') {
    throw new SnapshotError(`snapshot.json's protocol ${index} lacks a slug or a name`);
  }
  if (typeof p.tvl_usd !== 'number' || !Number.isFinite(p.tvl_usd)) {
    throw new SnapshotError(`snapshot.json's protocol ${index} lacks a TVL figure`);
  }
  return {
    slug: p.slug,
    name: p.name,
    category: textOrNull(p.category),
    chains: Array.isArray(p.chains) ? p.chains.filter((c): c is string => typeof c === 'string') : [],
    tvl_usd: p.tvl_usd,
    change_7d: numOrNull(p.change_7d),
    mcap_usd: numOrNull(p.mcap_usd),
    listed_at: textOrNull(p.listed_at),
    gecko_id: textOrNull(p.gecko_id),
    symbol: textOrNull(p.symbol),
  };
}

/** The snapshot out of its JSON text. */
export function parseSnapshot(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot.json is not JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new SnapshotError('snapshot.json is not a JSON object');
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.as_of)) {
    throw new SnapshotError('snapshot.json has no as_of date');
  }
  if (typeof o.source !== 'string') throw new SnapshotError('snapshot.json has no source');
  if (typeof o.floor_usd !== 'number' || !Number.isSafeInteger(o.floor_usd) || o.floor_usd <= 0) {
    throw new SnapshotError('snapshot.json has no floor_usd');
  }
  if (!Array.isArray(o.protocols)) throw new SnapshotError('snapshot.json has no protocols array');
  if (!Array.isArray(o.watchlist) || o.watchlist.some((s) => typeof s !== 'string')) {
    throw new SnapshotError('snapshot.json has no watchlist of slugs');
  }
  return {
    as_of: o.as_of,
    source: o.source,
    floor_usd: o.floor_usd,
    protocols: o.protocols.map(protocolAt),
    watchlist: o.watchlist as string[],
  };
}
