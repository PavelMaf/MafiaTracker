import { Card, PrimaryButton, SecondaryButton, TextInput } from '../ui/Controls';
import { useSessionStore } from '../state/store';
import { getRoleLabel } from '../domain/selectors';

const Table = () => {
  const { active, updatePlayer, eliminatePlayer, addStatus, removeStatus } = useSessionStore();

  if (!active) {
    return <div className="text-sm text-slate-400">Нет активной сессии.</div>;
  }

  return (
    <div className="space-y-6">
      <Card title="Игроки за столом">
        <div className="grid gap-3 md:grid-cols-2">
          {active.players.map((player) => (
            <div
              key={player.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{player.name}</div>
                  <div className="text-xs text-slate-400">Место: {player.seatIndex ?? '—'}</div>
                </div>
                <div className={`text-xs ${player.alive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {player.alive ? 'Жив' : 'Выбыл'}
                </div>
              </div>
              <div className="text-xs text-slate-400">Роль: {getRoleLabel(player.roleId)}</div>
              <div className="text-xs text-slate-500">Команда: {player.team ?? '—'}</div>
              <TextInput
                value={player.notes}
                onChange={(event) => updatePlayer(player.id, { notes: event.target.value })}
                placeholder="Заметки ведущего"
              />
              <div className="flex flex-wrap gap-2">
                <PrimaryButton onClick={() => eliminatePlayer(player.id, 'manual')}>Выбыл</PrimaryButton>
                <SecondaryButton onClick={() => updatePlayer(player.id, { alive: true })}>
                  Воскресить
                </SecondaryButton>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <SecondaryButton
                  onClick={() => addStatus(player.id, { type: 'protected', meta: { night: active.nightNumber } })}
                >
                  Защита
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => addStatus(player.id, { type: 'poisoned', meta: { night: active.nightNumber } })}
                >
                  Отравлен
                </SecondaryButton>
                <SecondaryButton onClick={() => removeStatus(player.id, 'protected')}>Снять защиту</SecondaryButton>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Table;
