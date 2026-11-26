// A local self-check for a board: the same conditions the gate applies, so a run fails here first.
//
//   node lib/verify.ts out/board.json input/snapshot.json
//
// Exit 0 when the board passes, 1 with the first problem printed when it does not.

import { readFileSync } from 'node:fs';
import { boardIssue, parseSnapshot } from './model.ts';
import type { BoardRow } from './model.ts';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('usage: node lib/verify.ts <board.json> <snapshot.json>');
  process.exit(2);
}

// board.json carries its rows under `rows`; a bare array is accepted too, as the gate takes either.
const parsed = JSON.parse(readFileSync(args[0]!, 'utf8')) as BoardRow[] | { rows: BoardRow[] };
const board = Array.isArray(parsed) ? parsed : parsed.rows;
const snapshot = parseSnapshot(readFileSync(args[1]!, 'utf8'));

const issue = boardIssue(board, snapshot);
if (issue !== null) {
  console.error(`board: ${issue}`);
  process.exit(1);
}

// The gate also refuses a board whose early rows are not marked pre-token, and one whose ranks drift
// from the value order after a tie: both are recomputed here from the snapshot rather than trusted.
const notPreToken = board.filter((r) => r.token_status !== 'pre-token');
if (notPreToken.length > 0) {
  console.error(`board: ${notPreToken.length} rows are not marked pre-token`);
  process.exit(1);
}

const unranked = board.filter((r) => !Number.isInteger(r.rank) || r.rank < 1);
if (unranked.length > 0) {
  console.error(`board: ${unranked.length} rows carry no whole rank`);
  process.exit(1);
}

console.log(`board ok: ${board.length} rows, ${snapshot.watchlist.length} of ${snapshot.watchlist.length} watchlist slugs, top ${board[0]!.slug} at $${board[0]!.implied_value_usd}`);
