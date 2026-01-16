import { GameEvent, SessionState, Status } from './models';
import { roleMap } from './roles';
import { winCheck } from './winCheck';

const getLatestAction = (state: SessionState, roleId: string) =>
  [...state.nightActions].reverse().find((action) => action.roleId === roleId) ?? null;

const addStatusEvent = (playerId: string, status: Status): GameEvent => ({
  type: 'PLAYER_STATUS_ADDED',
  playerId,
  status,
  timestamp: Date.now()
});

const removeStatusEvent = (playerId: string, statusType: Status['type']): GameEvent => ({
  type: 'PLAYER_STATUS_REMOVED',
  playerId,
  statusType,
  timestamp: Date.now()
});

export const resolveNight = (state: SessionState): GameEvent[] => {
  const events: GameEvent[] = [];
  const healRequested =
    Boolean(getLatestAction(state, 'witch')?.payload.healWolfVictim) ||
    Boolean(getLatestAction(state, 'wizard')?.payload.healWolfVictim);

  const bodyguardTarget = getLatestAction(state, 'bodyguard')?.payload.targetId as string | undefined;
  if (bodyguardTarget) {
    events.push(addStatusEvent(bodyguardTarget, { type: 'protected', meta: { night: state.nightNumber } }));
  }

  const amurTargets = getLatestAction(state, 'amur')?.payload.targets as string[] | undefined;
  if (amurTargets && amurTargets.length === 2) {
    const [a, b] = amurTargets;
    events.push(addStatusEvent(a, { type: 'lovers', meta: { linkedId: b } }));
    events.push(addStatusEvent(b, { type: 'lovers', meta: { linkedId: a } }));
  }

  const cultTarget = getLatestAction(state, 'cult_leader')?.payload.targetId as string | undefined;
  if (cultTarget && state.settings.enableSect) {
    events.push(addStatusEvent(cultTarget, { type: 'sectMember' }));
  }

  const priestAction = getLatestAction(state, 'priest');
  if (priestAction?.payload.targetId) {
    const mode = priestAction.payload.mode as string | undefined;
    if (mode === 'bless') {
      events.push(addStatusEvent(priestAction.payload.targetId as string, { type: 'blessed' }));
    }
    if (mode === 'cleanse') {
      events.push(removeStatusEvent(priestAction.payload.targetId as string, 'cursed'));
    }
  }

  const wolfTarget = getLatestAction(state, 'werewolf')?.payload.targetId as string | undefined;
  const poisonTarget = getLatestAction(state, 'witch')?.payload.poisonTarget as string | undefined;
  const wizardKillTarget = getLatestAction(state, 'wizard')?.payload.killTarget as string | undefined;

  const protectedTargets = new Set(
    events
      .filter((event): event is GameEvent & { type: 'PLAYER_STATUS_ADDED' } => event.type === 'PLAYER_STATUS_ADDED')
      .filter((event) => event.status.type === 'protected')
      .map((event) => event.playerId)
  );

  if (wolfTarget && !protectedTargets.has(wolfTarget) && !healRequested) {
    events.push({ type: 'PLAYER_ELIMINATED', playerId: wolfTarget, reason: 'night', timestamp: Date.now() });
  }

  if (poisonTarget && !protectedTargets.has(poisonTarget)) {
    events.push({ type: 'PLAYER_ELIMINATED', playerId: poisonTarget, reason: 'poison', timestamp: Date.now() });
  }

  if (wizardKillTarget && !protectedTargets.has(wizardKillTarget)) {
    events.push({ type: 'PLAYER_ELIMINATED', playerId: wizardKillTarget, reason: 'magic', timestamp: Date.now() });
  }

  const vampireTarget = getLatestAction(state, 'vampire')?.payload.targetId as string | undefined;
  if (vampireTarget && state.settings.enableVampires) {
    const statusType: Status = { type: 'delayedDeath', meta: { source: 'vampire', night: state.nightNumber } };
    events.push(addStatusEvent(vampireTarget, statusType));
  }

  const doppelTarget = getLatestAction(state, 'doppelganger')?.payload.targetId as string | undefined;
  if (doppelTarget) {
    events.push(addStatusEvent(doppelTarget, { type: 'marked', meta: { by: 'doppelganger' } }));
  }

  events.push({ type: 'NIGHT_ACTIONS_RESET', timestamp: Date.now() });
  return events;
};

export const resolveDay = (state: SessionState, voteTarget: string | null): GameEvent[] => {
  const events: GameEvent[] = [];
  if (voteTarget) {
    events.push({ type: 'PLAYER_ELIMINATED', playerId: voteTarget, reason: 'day', timestamp: Date.now() });
  }

  if (state.settings.enableVampires && state.settings.vampireKillTiming === 'dayAfterVote') {
    state.players
      .filter((player) => player.alive)
      .filter((player) => player.statuses.some((status) => status.type === 'delayedDeath'))
      .forEach((player) => {
        events.push({ type: 'PLAYER_ELIMINATED', playerId: player.id, reason: 'vampire', timestamp: Date.now() });
        events.push(removeStatusEvent(player.id, 'delayedDeath'));
      });
  }

  return events;
};

export const checkForWinEvents = (state: SessionState): GameEvent[] => {
  const result = winCheck(state);
  if (!result.winner) return [];
  return [
    {
      type: 'PHASE_SET',
      phase: 'ended',
      timestamp: Date.now()
    },
    {
      type: 'STAGE_SET',
      stage: 'ended',
      timestamp: Date.now()
    },
    {
      type: 'LOG_ENTRY_ADDED',
      entry: {
        id: `${Date.now()}-win`,
        timestamp: Date.now(),
        phase: 'ended',
        dayNumber: state.dayNumber,
        nightNumber: state.nightNumber,
        description: `Победа: ${result.winner}. ${result.reason}`
      },
      timestamp: Date.now()
    }
  ];
};

export const getRoleName = (roleId: string | null) => roleMap.get(roleId ?? '')?.nameRu ?? 'Без роли';
