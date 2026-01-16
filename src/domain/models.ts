export type Team = 'villagers' | 'werewolves' | 'vampires' | 'sect' | 'neutral';

export type Phase = 'setup' | 'night' | 'day' | 'ended';
export type Stage = 'players' | 'introNight' | 'day' | 'night' | 'ended';

export type RevealMode = 'none' | 'team' | 'role';

export type StatusType =
  | 'protected'
  | 'poisoned'
  | 'delayedDeath'
  | 'lovers'
  | 'oberegHolder'
  | 'sectMember'
  | 'blessed'
  | 'cursed'
  | 'marked';

export interface Status {
  type: StatusType;
  meta?: Record<string, string | number | boolean | null>;
}

export interface Player {
  id: string;
  name: string;
  seatIndex: number | null;
  roleId: string | null;
  team: Team | null;
  alive: boolean;
  statuses: Status[];
  notes: string;
}

export interface RoleVariant {
  id: string;
  name: string;
  description: string;
}

export type ActionField =
  | {
      kind: 'player';
      key: string;
      label: string;
      allowSelf?: boolean;
      allowDead?: boolean;
      multiple?: boolean;
      max?: number;
    }
  | { kind: 'toggle'; key: string; label: string }
  | { kind: 'choice'; key: string; label: string; options: { label: string; value: string }[] };

export interface ActionSchema {
  description: string;
  fields: ActionField[];
}

export interface Role {
  id: string;
  nameRu: string;
  team: Team;
  balancePoints: number;
  hasNightAction: boolean;
  nightOrder: number | null;
  actionSchema?: ActionSchema;
  variants?: RoleVariant[];
}

export interface NightAction {
  roleId: string;
  actorId: string;
  payload: Record<string, string | number | boolean | string[]>;
  resolvedOutcome?: string;
}

export interface Vote {
  voterId: string;
  targetId: string;
  weight: number;
}

export interface Settings {
  revealOnDeath: RevealMode;
  enableVampires: boolean;
  enableSect: boolean;
  enableObereg: boolean;
  sheriffDoubleVote: boolean;
  martyrMode: 'sacrifice' | 'night';
  bodyguardRepeatProtect: 'allow' | 'disallow';
  seerDetectMode: 'team' | 'role';
  wolfCubRevengeMode: 'doubleHunt' | 'sacrifice';
  vampireKillTiming: 'dayAfterVote' | 'immediate';
  cultLeaderInherit: boolean;
}

export interface SessionMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  phase: Phase;
  dayNumber: number;
  nightNumber: number;
  description: string;
}

export interface SessionState {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: Settings;
  phase: Phase;
  stage: Stage;
  dayNumber: number;
  nightNumber: number;
  players: Player[];
  events: GameEvent[];
  nightActions: NightAction[];
  votes: Vote[];
  log: LogEntry[];
}

export type GameEvent =
  | { type: 'SESSION_CREATED'; sessionId: string; name: string; settings: Settings; timestamp: number }
  | { type: 'SETTINGS_UPDATED'; settings: Settings; timestamp: number }
  | { type: 'STAGE_SET'; stage: Stage; timestamp: number }
  | { type: 'PLAYER_ADDED'; player: Player; timestamp: number }
  | { type: 'PLAYER_UPDATED'; playerId: string; patch: Partial<Player>; timestamp: number }
  | { type: 'PLAYER_REMOVED'; playerId: string; timestamp: number }
  | { type: 'SEATS_ASSIGNED'; seats: { playerId: string; seatIndex: number }[]; timestamp: number }
  | { type: 'ROLES_ASSIGNED'; assignments: { playerId: string; roleId: string; team: Team }[]; timestamp: number }
  | { type: 'PHASE_SET'; phase: Phase; timestamp: number }
  | { type: 'DAY_NIGHT_SET'; dayNumber: number; nightNumber: number; timestamp: number }
  | { type: 'NIGHT_ACTION_RECORDED'; action: NightAction; timestamp: number }
  | { type: 'NIGHT_ACTIONS_RESET'; timestamp: number }
  | { type: 'DAY_VOTE_RECORDED'; vote: Vote; timestamp: number }
  | { type: 'DAY_VOTES_RESET'; timestamp: number }
  | { type: 'LOG_ENTRY_ADDED'; entry: LogEntry; timestamp: number }
  | { type: 'PLAYER_STATUS_ADDED'; playerId: string; status: Status; timestamp: number }
  | { type: 'PLAYER_STATUS_REMOVED'; playerId: string; statusType: StatusType; timestamp: number }
  | { type: 'PLAYER_ELIMINATED'; playerId: string; reason: string; timestamp: number }
  | { type: 'EVENTS_TRUNCATED'; keepUntil: number; timestamp: number };
