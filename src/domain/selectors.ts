import { SessionState } from './models';
import { roleMap } from './roles';

export const getPlayerById = (state: SessionState, playerId: string) =>
  state.players.find((player) => player.id === playerId) ?? null;

export const getRoleLabel = (roleId: string | null) =>
  roleId ? roleMap.get(roleId)?.nameRu ?? '—' : '—';

export const getAlivePlayers = (state: SessionState) => state.players.filter((player) => player.alive);
