import Dexie, { Table } from 'dexie';
import { GameEvent, SessionMeta, SessionState } from '../domain/models';

export interface SessionRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  events: GameEvent[];
}

export interface SnapshotRecord {
  id?: number;
  sessionId: string;
  eventIndex: number;
  createdAt: number;
  state: SessionState;
}

export class MafiaDB extends Dexie {
  sessions!: Table<SessionRecord, string>;
  snapshots!: Table<SnapshotRecord, number>;

  constructor() {
    super('mafia-tracker');
    this.version(1).stores({
      sessions: 'id, createdAt, updatedAt',
      snapshots: '++id, sessionId, eventIndex, createdAt'
    });
  }
}

export const db = new MafiaDB();

export const toSessionMeta = (record: SessionRecord): SessionMeta => ({
  id: record.id,
  name: record.name,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt
});
