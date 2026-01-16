import { useMemo, useState } from 'react';
import { Card, PrimaryButton, SecondaryButton } from '../ui/Controls';
import { useSessionStore } from '../state/store';

const Day = () => {
  const { active, addVote, resetVotes, eliminatePlayer, setPhase, setDayNight, addLogEntry } =
    useSessionStore();
  const [voterId, setVoterId] = useState('');
  const [targetId, setTargetId] = useState('');

  if (!active) {
    return <div className="text-sm text-slate-400">Нет активной сессии.</div>;
  }

  const alive = active.players.filter((player) => player.alive);

  const voteTotals = useMemo(() => {
    const totals = new Map<string, number>();
    active.votes.forEach((vote) => {
      totals.set(vote.targetId, (totals.get(vote.targetId) ?? 0) + vote.weight);
    });
    return totals;
  }, [active.votes]);

  const handleVote = async () => {
    if (!voterId || !targetId) return;
    const voter = active.players.find((player) => player.id === voterId);
    const isMayor = voter?.roleId === 'mayor' && active.settings.sheriffDoubleVote;
    await addVote({ voterId, targetId, weight: isMayor ? 2 : 1 });
  };

  const resolveDay = async () => {
    let maxVotes = 0;
    let winner: string | null = null;
    voteTotals.forEach((value, key) => {
      if (value > maxVotes) {
        maxVotes = value;
        winner = key;
      }
    });
    if (winner) {
      await eliminatePlayer(winner, 'day');
    }
    await resetVotes();
    await addLogEntry({
      id: `${Date.now()}-day`,
      timestamp: Date.now(),
      phase: 'day',
      dayNumber: active.dayNumber,
      nightNumber: active.nightNumber,
      description: `День ${active.dayNumber} завершён`
    });
    await setPhase('night');
    await setDayNight(active.dayNumber, active.nightNumber + 1);
  };

  return (
    <div className="space-y-6">
      <Card title="Голосование">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">Голосующий</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
              value={voterId}
              onChange={(event) => setVoterId(event.target.value)}
            >
              <option value="">Выберите</option>
              {alive.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Цель</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
            >
              <option value="">Выберите</option>
              {alive.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 md:flex-row">
          <PrimaryButton onClick={handleVote}>Добавить голос</PrimaryButton>
          <SecondaryButton onClick={resetVotes}>Сбросить голоса</SecondaryButton>
        </div>
      </Card>

      <Card title="Итоги голосования">
        <div className="space-y-2 text-sm">
          {Array.from(voteTotals.entries()).map(([id, total]) => {
            const player = active.players.find((p) => p.id === id);
            return (
              <div key={id} className="flex items-center justify-between">
                <div>{player?.name ?? '—'}</div>
                <div className="font-semibold">{total}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Резолв дня">
        <PrimaryButton onClick={resolveDay}>Завершить день</PrimaryButton>
      </Card>
    </div>
  );
};

export default Day;
