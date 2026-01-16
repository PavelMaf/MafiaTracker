import { describe, expect, it } from 'vitest';
import { applyEvent, createEmptyState, rebuildState } from '../applyEvent';
import { defaultSettings } from '../settings';

const baseTimestamp = 1000;

describe('applyEvent', () => {
  it('creates session and updates settings', () => {
    const state = createEmptyState();
    const created = applyEvent(state, {
      type: 'SESSION_CREATED',
      sessionId: 's1',
      name: 'Test',
      settings: defaultSettings,
      timestamp: baseTimestamp
    });
    const updated = applyEvent(created, {
      type: 'SETTINGS_UPDATED',
      settings: { ...defaultSettings, enableVampires: true },
      timestamp: baseTimestamp + 1
    });
    expect(updated.id).toBe('s1');
    expect(updated.settings.enableVampires).toBe(true);
  });

  it('adds and updates player', () => {
    const state = createEmptyState();
    const created = applyEvent(state, {
      type: 'SESSION_CREATED',
      sessionId: 's2',
      name: 'Test',
      settings: defaultSettings,
      timestamp: baseTimestamp
    });
    const added = applyEvent(created, {
      type: 'PLAYER_ADDED',
      player: {
        id: 'p1',
        name: 'Player 1',
        seatIndex: null,
        roleId: null,
        team: null,
        alive: true,
        statuses: [],
        notes: ''
      },
      timestamp: baseTimestamp + 1
    });
    const updated = applyEvent(added, {
      type: 'PLAYER_UPDATED',
      playerId: 'p1',
      patch: { name: 'Updated' },
      timestamp: baseTimestamp + 2
    });
    expect(updated.players[0].name).toBe('Updated');
  });

  it('assigns seats and roles', () => {
    const state = rebuildState([
      {
        type: 'SESSION_CREATED',
        sessionId: 's3',
        name: 'Test',
        settings: defaultSettings,
        timestamp: baseTimestamp
      },
      {
        type: 'PLAYER_ADDED',
        player: {
          id: 'p2',
          name: 'Player 2',
          seatIndex: null,
          roleId: null,
          team: null,
          alive: true,
          statuses: [],
          notes: ''
        },
        timestamp: baseTimestamp + 1
      }
    ]);

    const seated = applyEvent(state, {
      type: 'SEATS_ASSIGNED',
      seats: [{ playerId: 'p2', seatIndex: 1 }],
      timestamp: baseTimestamp + 2
    });
    const assigned = applyEvent(seated, {
      type: 'ROLES_ASSIGNED',
      assignments: [{ playerId: 'p2', roleId: 'seer', team: 'villagers' }],
      timestamp: baseTimestamp + 3
    });
    expect(assigned.players[0].seatIndex).toBe(1);
    expect(assigned.players[0].roleId).toBe('seer');
  });

  it('eliminates player', () => {
    const state = rebuildState([
      {
        type: 'SESSION_CREATED',
        sessionId: 's4',
        name: 'Test',
        settings: defaultSettings,
        timestamp: baseTimestamp
      },
      {
        type: 'PLAYER_ADDED',
        player: {
          id: 'p3',
          name: 'Player 3',
          seatIndex: null,
          roleId: null,
          team: null,
          alive: true,
          statuses: [],
          notes: ''
        },
        timestamp: baseTimestamp + 1
      }
    ]);

    const eliminated = applyEvent(state, {
      type: 'PLAYER_ELIMINATED',
      playerId: 'p3',
      reason: 'day',
      timestamp: baseTimestamp + 2
    });

    expect(eliminated.players[0].alive).toBe(false);
  });
});
