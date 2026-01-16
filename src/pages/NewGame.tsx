import { useMemo, useState } from 'react';
import { Card, PrimaryButton, SecondaryButton, TextInput } from '../ui/Controls';
import { useSessionStore } from '../state/store';

const NewGame = () => {
  const { active, addPlayer, updatePlayer, assignSeats } = useSessionStore();
  const [playerName, setPlayerName] = useState('');

  const sortedPlayers = useMemo(
    () => active?.players.slice().sort((a, b) => (a.seatIndex ?? 999) - (b.seatIndex ?? 999)) ?? [],
    [active]
  );

  if (!active) {
    return <div className="text-sm text-slate-400">Создайте или выберите сессию на главной странице.</div>;
  }

  const handleAdd = async () => {
    if (!playerName.trim()) return;
    await addPlayer(playerName.trim());
    setPlayerName('');
  };

  const handleAssignByOrder = async () => {
    const seats = sortedPlayers.map((player, index) => ({ playerId: player.id, seatIndex: index }));
    await assignSeats(seats);
  };

  return (
    <div className="space-y-6">
      <Card title="Игроки">
        <div className="flex flex-col gap-3 md:flex-row">
          <TextInput
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Имя игрока"
          />
          <PrimaryButton onClick={handleAdd}>Добавить</PrimaryButton>
        </div>
        <div className="mt-4 space-y-2">
          {sortedPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-2"
            >
              <div className="text-sm font-medium">{player.name}</div>
              <div className="ml-auto flex items-center gap-2">
                <TextInput
                  type="number"
                  className="w-20"
                  value={player.seatIndex ?? ''}
                  onChange={(event) =>
                    updatePlayer(player.id, { seatIndex: event.target.value === '' ? null : Number(event.target.value) })
                  }
                  placeholder="#"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <SecondaryButton onClick={handleAssignByOrder}>Назначить по порядку</SecondaryButton>
        </div>
      </Card>

      <Card title="Базовые настройки">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm">
            Фаза: <span className="font-semibold">{active.phase}</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm">
            День {active.dayNumber} / Ночь {active.nightNumber}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NewGame;
