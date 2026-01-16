import { GameEvent, LogEntry, SessionState } from './models';

export const createEmptyState = (): SessionState => ({
  id: '',
  name: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: {
    revealOnDeath: 'team',
    enableVampires: false,
    enableSect: false,
    enableObereg: false,
    sheriffDoubleVote: true,
    martyrMode: 'sacrifice',
    bodyguardRepeatProtect: 'disallow',
    seerDetectMode: 'team',
    wolfCubRevengeMode: 'doubleHunt',
    vampireKillTiming: 'dayAfterVote',
    cultLeaderInherit: false
  },
  phase: 'setup',
  stage: 'players',
  dayNumber: 1,
  nightNumber: 1,
  players: [],
  events: [],
  nightActions: [],
  votes: [],
  log: []
});

export const applyEvent = (state: SessionState, event: GameEvent): SessionState => {
  const next = { ...state, updatedAt: event.timestamp, events: [...state.events, event] };
  switch (event.type) {
    case 'SESSION_CREATED':
      return {
        ...next,
        id: event.sessionId,
        name: event.name,
        createdAt: event.timestamp,
        settings: event.settings,
        phase: 'setup',
        stage: 'players',
        dayNumber: 1,
        nightNumber: 1
      };
    case 'SETTINGS_UPDATED':
      return { ...next, settings: event.settings };
    case 'STAGE_SET':
      return { ...next, stage: event.stage };
    case 'PLAYER_ADDED':
      return { ...next, players: [...next.players, event.player] };
    case 'PLAYER_UPDATED':
      return {
        ...next,
        players: next.players.map((player) =>
          player.id === event.playerId ? { ...player, ...event.patch } : player
        )
      };
    case 'PLAYER_REMOVED':
      return { ...next, players: next.players.filter((player) => player.id !== event.playerId) };
    case 'SEATS_ASSIGNED':
      return {
        ...next,
        players: next.players.map((player) => {
          const seat = event.seats.find((item) => item.playerId === player.id);
          return seat ? { ...player, seatIndex: seat.seatIndex } : player;
        })
      };
    case 'ROLES_ASSIGNED':
      return {
        ...next,
        players: next.players.map((player) => {
          const assignment = event.assignments.find((item) => item.playerId === player.id);
          return assignment
            ? { ...player, roleId: assignment.roleId, team: assignment.team }
            : player;
        })
      };
    case 'PHASE_SET':
      return { ...next, phase: event.phase };
    case 'DAY_NIGHT_SET':
      return { ...next, dayNumber: event.dayNumber, nightNumber: event.nightNumber };
    case 'NIGHT_ACTION_RECORDED':
      return { ...next, nightActions: [...next.nightActions, event.action] };
    case 'NIGHT_ACTIONS_RESET':
      return { ...next, nightActions: [] };
    case 'DAY_VOTE_RECORDED':
      return { ...next, votes: [...next.votes, event.vote] };
    case 'DAY_VOTES_RESET':
      return { ...next, votes: [] };
    case 'LOG_ENTRY_ADDED':
      return { ...next, log: [...next.log, event.entry as LogEntry] };
    case 'PLAYER_STATUS_ADDED':
      return {
        ...next,
        players: next.players.map((player) =>
          player.id === event.playerId
            ? { ...player, statuses: [...player.statuses, event.status] }
            : player
        )
      };
    case 'PLAYER_STATUS_REMOVED':
      return {
        ...next,
        players: next.players.map((player) =>
          player.id === event.playerId
            ? {
                ...player,
                statuses: player.statuses.filter((status) => status.type !== event.statusType)
              }
            : player
        )
      };
    case 'PLAYER_ELIMINATED':
      return {
        ...next,
        players: next.players.map((player) =>
          player.id === event.playerId ? { ...player, alive: false } : player
        )
      };
    case 'EVENTS_TRUNCATED':
      return {
        ...next,
        events: next.events.slice(0, event.keepUntil + 1),
        nightActions: next.nightActions.slice(0, event.keepUntil + 1)
      };
    default:
      return next;
  }
};

export const rebuildState = (events: GameEvent[]): SessionState => {
  return events.reduce((state, event) => applyEvent(state, event), createEmptyState());
};
