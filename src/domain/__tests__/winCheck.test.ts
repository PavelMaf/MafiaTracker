import { describe, expect, it } from 'vitest';
import { winCheck } from '../winCheck';
import { SessionState } from '../models';
import { defaultSettings } from '../settings';

const createState = (players: SessionState['players'], events: SessionState['events'] = []): SessionState => ({
  id: 's1',
  name: 'Test',
  createdAt: 1,
  updatedAt: 1,
  settings: defaultSettings,
  phase: 'day',
  dayNumber: 1,
  nightNumber: 1,
  players,
  events,
  nightActions: [],
  votes: [],
  log: []
});

describe('winCheck', () => {
  it('villagers win when no wolves remain', () => {
    const state = createState([
      {
        id: 'p1',
        name: 'Villager',
        seatIndex: 0,
        roleId: 'seer',
        team: 'villagers',
        alive: true,
        statuses: [],
        notes: ''
      }
    ]);
    const result = winCheck(state);
    expect(result.winner).toBe('Селяне');
  });

  it('wolves win when they dominate', () => {
    const state = createState([
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
    const result = winCheck(state);
    expect(result.winner).toBe('Оборотни');
  });

  it('tanner wins when eliminated by day', () => {
    const state = createState(
      [
        {
          id: 'p1',
          name: 'Tanner',
          seatIndex: 0,
          roleId: 'tanner',
          team: 'neutral',
          alive: false,
          statuses: [],
          notes: ''
        }
      ],
      [
        {
          type: 'PLAYER_ELIMINATED',
          playerId: 'p1',
          reason: 'day',
          timestamp: 2
        }
      ]
    );
    const result = winCheck(state);
    expect(result.winner).toBe('Дубильщик');
  });
});
