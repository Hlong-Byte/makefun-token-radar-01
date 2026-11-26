// The library's one import point: main.ts and verify.ts read the board's parts from here, and the parts
// themselves live in small files beside this one.

export { MODEL, MODEL_VERSION, EARLY_ROWS, LIVE_ROWS, ageDays, impliedValue, isPreToken, isRankable, round4 } from './score.ts';
export { parseSnapshot } from './snapshot.ts';
export { farmSteps, stepText } from './farm.ts';
export { buildBoard, buildRadar, liveRows, radarRow } from './board.ts';
export { boardIssue, dataScript } from './wire.ts';
export { SnapshotError } from './types.ts';
export type {
  BoardRow,
  FarmStep,
  LiveRow,
  ModelConstants,
  RadarData,
  RadarRow,
  Score,
  Snapshot,
  SnapshotProtocol,
} from './types.ts';
