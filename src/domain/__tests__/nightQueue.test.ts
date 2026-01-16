import { describe, expect, it } from 'vitest';
import { nightQueue } from '../nightQueue';
import { SessionState } from '../models';
import { defaultSettings } from '../settings';

const baseState = (players: SessionState['players'], overrides?: Partial<SessionState>): SessionState => ({
  id: 's1',
  name: 'Test',
  createdAt: 1,
  updatedAt: 1,
  settings: defaultSettings,
  phase: 'night',
  stage: 'night',
  dayNumber: 1,
  nightNumber: 1,
  players,
  events: [],
  nightActions: [],
  votes: [],
  log: [],
  ...overrides
});

describe('nightQueue', () => {
  it('orders roles by night order', () => {
    const state = baseState([
      {
        id: 'p1',
        name: 'Seer',
        seatIndex: 0,
        roleId: 'seer',
        team: 'villagers',
        alive: true,
        statuses: [],
        notes: ''
      },
      {
        id: 'p2',
        name: 'Bodyguard',
        seatIndex: 1,
        roleId: 'bodyguard',
        team: 'villagers',
        alive: true,
        statuses: [],
        notes: ''
      }
    ]);
    const queue = nightQueue(state);
    expect(queue[0].role.id).toBe('seer');
    expect(queue[1].role.id).toBe('bodyguard');
  });

  it('includes wolf hunt step', () => {
    const state = baseState([
      {
        id: 'p1',
        name: 'Wolf',
        seatIndex: 0,
        roleId: 'werewolf',
        team: 'werewolves',
        alive: true,
        statuses: [],
        notes: ''
      },
      {
        id: 'p2',
        name: 'Villager',
        seatIndex: 1,
        roleId: 'seer',
        team: 'villagers',
        alive: true,
        statuses: [],
        notes: ''
      }
    ]);
    const queue = nightQueue(state);
    expect(queue.some((step) => step.role.id === 'werewolf')).toBe(true);
  });
});
