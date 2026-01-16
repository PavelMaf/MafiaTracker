import { z } from 'zod';
import { db, SessionRecord } from './db';
import { GameEvent, SessionState } from '../domain/models';
import { applyEvent, rebuildState } from '../domain/applyEvent';

const statusSchema = z.object({
  type: z.string(),
  meta: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
});

const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  seatIndex: z.number().nullable(),
  roleId: z.string().nullable(),
  team: z.string().nullable(),
  alive: z.boolean(),
  statuses: z.array(statusSchema),
  notes: z.string()
});

const settingsSchema = z.object({
  revealOnDeath: z.union([z.literal('none'), z.literal('team'), z.literal('role')]),
  enableVampires: z.boolean(),
  enableSect: z.boolean(),
  enableObereg: z.boolean(),
  sheriffDoubleVote: z.boolean(),
  martyrMode: z.union([z.literal('sacrifice'), z.literal('night')]),
  bodyguardRepeatProtect: z.union([z.literal('allow'), z.literal('disallow')]),
  seerDetectMode: z.union([z.literal('team'), z.literal('role')]),
  wolfCubRevengeMode: z.union([z.literal('doubleHunt'), z.literal('sacrifice')]),
  vampireKillTiming: z.union([z.literal('dayAfterVote'), z.literal('immediate')]),
  cultLeaderInherit: z.boolean()
});

const eventSchema = z.object({
  type: z.string(),
  timestamp: z.number()
}).passthrough();

const exportSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  settings: settingsSchema,
  players: z.array(playerSchema),
  events: z.array(eventSchema)
});

export type ExportPayload = z.infer<typeof exportSchema>;

const SNAPSHOT_EVERY = 10;
const SNAPSHOT_KEEP = 50;

export const listSessions = async () => {
  const records = await db.sessions.orderBy('updatedAt').reverse().toArray();
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }));
};

export const loadSession = async (sessionId: string): Promise<SessionState | null> => {
  const record = await db.sessions.get(sessionId);
  if (!record) return null;
  return rebuildState(record.events);
};

export const saveEvent = async (sessionId: string, event: GameEvent) => {
  const record = await db.sessions.get(sessionId);
  if (!record) return;
  const events = [...record.events, event];
  await db.sessions.put({
    ...record,
    updatedAt: event.timestamp,
    events
  });
  if (events.length % SNAPSHOT_EVERY === 0) {
    await saveSnapshot(sessionId, events.length - 1, rebuildState(events));
  }
};

export const saveSession = async (state: SessionState) => {
  const record: SessionRecord = {
    id: state.id,
    name: state.name,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    events: state.events
  };
  await db.sessions.put(record);
};

export const saveSnapshot = async (sessionId: string, eventIndex: number, state: SessionState) => {
  await db.snapshots.add({ sessionId, eventIndex, createdAt: Date.now(), state });
  const snapshots = await db.snapshots.where('sessionId').equals(sessionId).sortBy('createdAt');
  if (snapshots.length > SNAPSHOT_KEEP) {
    const toDelete = snapshots.slice(0, snapshots.length - SNAPSHOT_KEEP);
    await db.snapshots.bulkDelete(toDelete.map((item) => item.id!).filter(Boolean));
  }
};

export const loadLatestSnapshot = async (sessionId: string) => {
  const snapshots = await db.snapshots.where('sessionId').equals(sessionId).sortBy('createdAt');
  return snapshots.at(-1) ?? null;
};

export const panicRecover = async (sessionId: string) => {
  const record = await db.sessions.get(sessionId);
  if (!record) return null;
  const snapshot = await loadLatestSnapshot(sessionId);
  if (!snapshot) return rebuildState(record.events);
  const remaining = record.events.slice(snapshot.eventIndex + 1);
  return remaining.reduce((state, event) => applyEvent(state, event), snapshot.state);
};

export const exportSession = async (sessionId: string): Promise<ExportPayload | null> => {
  const record = await db.sessions.get(sessionId);
  if (!record) return null;
  const state = rebuildState(record.events);
  return {
    id: state.id,
    name: state.name,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
    settings: state.settings,
    players: state.players,
    events: record.events
  };
};

export const importSession = async (payload: unknown) => {
  const parsed = exportSchema.parse(payload);
  const state = rebuildState(parsed.events);
  const record: SessionRecord = {
    id: parsed.id,
    name: parsed.name,
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
    events: parsed.events as GameEvent[]
  };
  await db.sessions.put(record);
  await saveSnapshot(parsed.id, state.events.length - 1, state);
  return state;
};
