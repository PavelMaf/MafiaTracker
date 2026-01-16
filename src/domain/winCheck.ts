import { SessionState } from './models';

export interface WinResult {
  winner: string | null;
  reason: string;
}

export const winCheck = (state: SessionState): WinResult => {
  const alive = state.players.filter((player) => player.alive);
  const aliveTeams = new Map<string, number>();
  alive.forEach((player) => {
    const team = player.team ?? 'neutral';
    aliveTeams.set(team, (aliveTeams.get(team) ?? 0) + 1);
  });

  const loneWolfAlive = alive.find((player) => player.roleId === 'lone_wolf');
  if (loneWolfAlive && alive.length === 1) {
    return { winner: 'Одиночка', reason: 'Остался один в живых.' };
  }

  const tannerDeadByDay = state.events.some(
    (event) =>
      event.type === 'PLAYER_ELIMINATED' &&
      event.reason === 'day' &&
      state.players.find((player) => player.id === event.playerId)?.roleId === 'tanner'
  );
  if (tannerDeadByDay) {
    return { winner: 'Дубильщик', reason: 'Казнён днём.' };
  }

  const banditAlive = alive.find((player) => player.roleId === 'bandit');
  if (banditAlive && alive.length === 1) {
    return { winner: 'Бандит', reason: 'Остался один в живых.' };
  }

  if (state.settings.enableSect) {
    const aliveNonSect = alive.filter(
      (player) =>
        player.roleId !== 'cult_leader' &&
        !player.statuses.some((status) => status.type === 'sectMember')
    );
    if (alive.length > 0 && aliveNonSect.length === 0) {
      return { winner: 'Секта', reason: 'Все живые игроки — сектанты.' };
    }
  }

  if (state.settings.enableVampires) {
    const vampireAlive = alive.filter((player) => player.team === 'vampires');
    if (vampireAlive.length > 0 && vampireAlive.length === alive.length) {
      return { winner: 'Вампиры', reason: 'В живых остались только вампиры.' };
    }
  }

  const wolvesAlive = aliveTeams.get('werewolves') ?? 0;
  const villagersAlive = aliveTeams.get('villagers') ?? 0;
  const neutralAlive = aliveTeams.get('neutral') ?? 0;
  const vampiresAlive = aliveTeams.get('vampires') ?? 0;
  const sectAlive = aliveTeams.get('sect') ?? 0;

  const others = villagersAlive + neutralAlive + vampiresAlive + sectAlive;
  if (wolvesAlive > 0 && wolvesAlive >= others) {
    return { winner: 'Оборотни', reason: 'Оборотни контролируют игру.' };
  }

  if (wolvesAlive === 0 && vampiresAlive === 0 && sectAlive === 0) {
    return { winner: 'Селяне', reason: 'Все угрозы устранены.' };
  }

  return { winner: null, reason: '' };
};
