import { create } from 'zustand';
import { GameEvent, LogEntry, NightAction, Player, SessionState, Status, StatusType, Vote } from '../domain/models';
import { applyEvent, createEmptyState, rebuildState } from '../domain/applyEvent';
import { defaultSettings } from '../domain/settings';
import { loadSession, listSessions, panicRecover, saveEvent, saveSession } from '../storage/persistence';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface SessionStore {
  sessions: { id: string; name: string; createdAt: number; updatedAt: number }[];
  active: SessionState | null;
  loading: boolean;
  init: () => Promise<void>;
  createSession: (name: string) => Promise<void>;
  loadSessionById: (id: string) => Promise<void>;
  recordEvent: (event: GameEvent) => Promise<void>;
  updateSettings: (settings: SessionState['settings']) => Promise<void>;
  addPlayer: (name: string) => Promise<void>;
  updatePlayer: (playerId: string, patch: Partial<Player>) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  assignSeats: (seatOrder: { playerId: string; seatIndex: number }[]) => Promise<void>;
  assignRoles: (assignments: { playerId: string; roleId: string; team: Player['team'] }[]) => Promise<void>;
  setPhase: (phase: SessionState['phase']) => Promise<void>;
  setDayNight: (dayNumber: number, nightNumber: number) => Promise<void>;
  addNightAction: (action: NightAction) => Promise<void>;
  addVote: (vote: Vote) => Promise<void>;
  resetVotes: () => Promise<void>;
  addLogEntry: (entry: LogEntry) => Promise<void>;
  addStatus: (playerId: string, status: Status) => Promise<void>;
  removeStatus: (playerId: string, statusType: StatusType) => Promise<void>;
  eliminatePlayer: (playerId: string, reason: string) => Promise<void>;
  panic: () => Promise<void>;
  truncateEvents: (keepUntil: number) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  active: null,
  loading: false,
  init: async () => {
    set({ loading: true });
    const sessions = await listSessions();
    set({ sessions, loading: false });
  },
  createSession: async (name: string) => {
    const timestamp = Date.now();
    const sessionId = createId();
    const initialEvent: GameEvent = {
      type: 'SESSION_CREATED',
      sessionId,
      name,
      settings: defaultSettings,
      timestamp
    };
    const state = applyEvent(createEmptyState(), initialEvent);
    await saveSession(state);
    set((current) => ({
      sessions: [{ id: sessionId, name, createdAt: timestamp, updatedAt: timestamp }, ...current.sessions],
      active: state
    }));
  },
  loadSessionById: async (id: string) => {
    set({ loading: true });
    const state = await loadSession(id);
    set({ active: state, loading: false });
  },
  recordEvent: async (event: GameEvent) => {
    const state = get().active;
    if (!state) return;
    const next = applyEvent(state, event);
    set({ active: next });
    await saveEvent(state.id, event);
    await saveSession(next);
    set((current) => ({
      sessions: current.sessions.map((session) =>
        session.id === state.id ? { ...session, updatedAt: event.timestamp } : session
      )
    }));
  },
  updateSettings: async (settings) => {
    await get().recordEvent({ type: 'SETTINGS_UPDATED', settings, timestamp: Date.now() });
  },
  addPlayer: async (name: string) => {
    const state = get().active;
    if (!state) return;
    const player: Player = {
      id: createId(),
      name,
      seatIndex: null,
      roleId: null,
      team: null,
      alive: true,
      statuses: [],
      notes: ''
    };
    await get().recordEvent({ type: 'PLAYER_ADDED', player, timestamp: Date.now() });
  },
  updatePlayer: async (playerId, patch) => {
    await get().recordEvent({ type: 'PLAYER_UPDATED', playerId, patch, timestamp: Date.now() });
  },
  removePlayer: async (playerId) => {
    await get().recordEvent({ type: 'PLAYER_REMOVED', playerId, timestamp: Date.now() });
  },
  assignSeats: async (seats) => {
    await get().recordEvent({ type: 'SEATS_ASSIGNED', seats, timestamp: Date.now() });
  },
  assignRoles: async (assignments) => {
    await get().recordEvent({ type: 'ROLES_ASSIGNED', assignments, timestamp: Date.now() });
  },
  setPhase: async (phase) => {
    await get().recordEvent({ type: 'PHASE_SET', phase, timestamp: Date.now() });
  },
  setDayNight: async (dayNumber, nightNumber) => {
    await get().recordEvent({ type: 'DAY_NIGHT_SET', dayNumber, nightNumber, timestamp: Date.now() });
  },
  addNightAction: async (action) => {
    await get().recordEvent({ type: 'NIGHT_ACTION_RECORDED', action, timestamp: Date.now() });
  },
  addVote: async (vote) => {
    await get().recordEvent({ type: 'DAY_VOTE_RECORDED', vote, timestamp: Date.now() });
  },
  resetVotes: async () => {
    await get().recordEvent({ type: 'DAY_VOTES_RESET', timestamp: Date.now() });
  },
  addLogEntry: async (entry) => {
    await get().recordEvent({ type: 'LOG_ENTRY_ADDED', entry, timestamp: Date.now() });
  },
  addStatus: async (playerId, status) => {
    await get().recordEvent({ type: 'PLAYER_STATUS_ADDED', playerId, status, timestamp: Date.now() });
  },
  removeStatus: async (playerId, statusType) => {
    await get().recordEvent({ type: 'PLAYER_STATUS_REMOVED', playerId, statusType, timestamp: Date.now() });
  },
  eliminatePlayer: async (playerId, reason) => {
    await get().recordEvent({ type: 'PLAYER_ELIMINATED', playerId, reason, timestamp: Date.now() });
  },
  panic: async () => {
    const state = get().active;
    if (!state) return;
    const recovered = await panicRecover(state.id);
    if (recovered) {
      set({ active: recovered });
    }
  },
  truncateEvents: async (keepUntil) => {
    const state = get().active;
    if (state) {
      const events = state.events.slice(0, keepUntil + 1);
      const rebuilt = rebuildState(events);
      set({ active: rebuilt });
      await saveSession(rebuilt);
    }
  }
}));
