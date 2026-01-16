import { describe, expect, it } from 'vitest';
import { rebuildState } from '../applyEvent';
import { defaultSettings } from '../settings';

const events = [
  {
    type: 'SESSION_CREATED',
    sessionId: 's1',
    name: 'Test',
    settings: defaultSettings,
    timestamp: 1
  },
  {
    type: 'PLAYER_ADDED',
    player: {
      id: 'p1',
      name: 'Player',
      seatIndex: null,
      roleId: null,
      team: null,
      alive: true,
      statuses: [],
      notes: ''
    },
    timestamp: 2
  },
  {
    type: 'PLAYER_UPDATED',
    playerId: 'p1',
    patch: { seatIndex: 2 },
    timestamp: 3
  }
] as const;

describe('rebuildState', () => {
  it('rebuilds from events', () => {
    const state = rebuildState(events as any);
    expect(state.players[0].seatIndex).toBe(2);
  });

  it('supports rollback by truncation', () => {
    const truncated = rebuildState(events.slice(0, 2) as any);
    expect(truncated.players[0].seatIndex).toBeNull();
  });
});
