import { useMemo, useState } from 'react';
import { Card, PrimaryButton, SecondaryButton, TextInput } from '../ui/Controls';
import { useSessionStore } from '../state/store';
import { roles, roleMap } from '../domain/roles';
import { getRoleLabel } from '../domain/selectors';
import { getRoleName } from '../domain/resolve';

const stageLabels: Record<string, string> = {
  players: 'Ввод игроков',
  introNight: 'Ночь знакомства',
  day: 'День / Голосование',
  night: 'Ночь',
  ended: 'Игра завершена'
};

const Flow = () => {
  const {
    active,
    addPlayer,
    updatePlayer,
    assignSeats,
    assignRoles,
    addNightAction,
    addVote,
    resetVotes,
    setStage,
    setPhase,
    setDayNight,
    resolveNightStage,
    resolveDayStage,
    addLogEntry
  } = useSessionStore();
  const [playerName, setPlayerName] = useState('');
  const [localRoles, setLocalRoles] = useState<Record<string, string>>({});
  const [voterId, setVoterId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [actorId, setActorId] = useState('');
  const [payload, setPayload] = useState<Record<string, string | boolean | string[]>>({});

  const players = active?.players ?? [];
  const sortedPlayers = useMemo(
    () => players.slice().sort((a, b) => (a.seatIndex ?? 999) - (b.seatIndex ?? 999)),
    [players]
  );

  const balance = useMemo(() => {
    return players.reduce((sum, player) => {
      const roleId = localRoles[player.id] ?? player.roleId;
      const role = roleId ? roleMap.get(roleId) : null;
      return sum + (role?.balancePoints ?? 0);
    }, 0);
  }, [players, localRoles]);

  if (!active) {
    return <div className="text-sm text-slate-400">Создайте или выберите сессию на главной странице.</div>;
  }

  const stage = active.stage;

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return;
    await addPlayer(playerName.trim());
    setPlayerName('');
  };

  const handleAssignByOrder = async () => {
    const seats = sortedPlayers.map((player, index) => ({ playerId: player.id, seatIndex: index }));
    await assignSeats(seats);
  };

  const handleSaveRoles = async () => {
    const assignments = players
      .map((player) => {
        const roleId = localRoles[player.id] ?? player.roleId;
        if (!roleId) return null;
        const role = roleMap.get(roleId);
        if (!role) return null;
        return { playerId: player.id, roleId, team: role.team };
      })
      .filter(Boolean) as { playerId: string; roleId: string; team: NonNullable<(typeof players)[number]['team']> }[];
    await assignRoles(assignments);
  };

  const handleIntroNightComplete = async () => {
    await handleSaveRoles();
    await addLogEntry({
      id: `${Date.now()}-intro`,
      timestamp: Date.now(),
      phase: 'night',
      dayNumber: active.dayNumber,
      nightNumber: active.nightNumber,
      description: 'Ночь знакомства завершена'
    });
    await setPhase('day');
    await setStage('day');
  };

  const handleDayVote = async () => {
    if (!voterId || !targetId) return;
    const voter = active.players.find((player) => player.id === voterId);
    const isMayor = voter?.roleId === 'mayor' && active.settings.sheriffDoubleVote;
    await addVote({ voterId, targetId, weight: isMayor ? 2 : 1 });
  };

  const handleResolveDay = async () => {
    await resolveDayStage();
    await addLogEntry({
      id: `${Date.now()}-day`,
      timestamp: Date.now(),
      phase: 'day',
      dayNumber: active.dayNumber,
      nightNumber: active.nightNumber,
      description: `День ${active.dayNumber} завершён`
    });
    await setPhase('night');
    await setStage('night');
    await setDayNight(active.dayNumber, active.nightNumber + 1);
    await resetVotes();
  };

  const nightQueue = useMemo(() => {
    if (!active) return [];
    return roles
      .filter((role) => role.hasNightAction)
      .filter((role) => role.nightOrder !== null)
      .filter((role) => (role.id === 'vampire' ? active.settings.enableVampires : true))
      .filter((role) => (role.id === 'cult_leader' ? active.settings.enableSect : true))
      .sort((a, b) => (a.nightOrder ?? 0) - (b.nightOrder ?? 0));
  }, [active]);

  const stepRole = nightQueue[stepIndex];
  const alivePlayers = active.players.filter((player) => player.alive);

  const handleNightAction = async () => {
    if (!stepRole || !actorId) return;
    await addNightAction({ roleId: stepRole.id, actorId, payload });
    setPayload({});
  };

  const handleResolveNight = async () => {
    await resolveNightStage();
    await addLogEntry({
      id: `${Date.now()}-night`,
      timestamp: Date.now(),
      phase: 'night',
      dayNumber: active.dayNumber,
      nightNumber: active.nightNumber,
      description: `Ночь ${active.nightNumber} завершена`
    });
    await setPhase('day');
    await setStage('day');
    await setDayNight(active.dayNumber + 1, active.nightNumber);
  };

  return (
    <div className="space-y-6">
      <Card title="Стадии игры">
        <div className="flex flex-wrap gap-2 text-xs">
          {(['players', 'introNight', 'day', 'night', 'ended'] as const).map((item) => (
            <span
              key={item}
              className={`rounded-full border px-3 py-1 ${
                stage === item ? 'border-accent text-accent' : 'border-slate-700 text-slate-400'
              }`}
            >
              {stageLabels[item]}
            </span>
          ))}
        </div>
        <div className="mt-2 text-sm">Текущая стадия: {stageLabels[stage]}</div>
      </Card>

      {stage === 'players' && (
        <Card title="Ввод игроков">
          <div className="flex flex-col gap-3 md:flex-row">
            <TextInput value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Имя" />
            <PrimaryButton onClick={handleAddPlayer}>Добавить</PrimaryButton>
          </div>
          <div className="mt-4 space-y-2">
            {sortedPlayers.map((player) => (
              <div key={player.id} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-2">
                <div className="text-sm font-medium">{player.name}</div>
                <TextInput
                  type="number"
                  className="ml-auto w-20"
                  value={player.seatIndex ?? ''}
                  onChange={(event) =>
                    updatePlayer(player.id, { seatIndex: event.target.value === '' ? null : Number(event.target.value) })
                  }
                  placeholder="#"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <SecondaryButton onClick={handleAssignByOrder}>Назначить по порядку</SecondaryButton>
            <PrimaryButton onClick={() => setStage('introNight')} disabled={players.length === 0}>
              Перейти к ночи знакомства
            </PrimaryButton>
          </div>
        </Card>
      )}

      {stage === 'introNight' && (
        <Card title="Ночь знакомства (запись ролей)">
          <div className="mb-3 text-sm text-slate-400">Сумма очков: {balance}</div>
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center">
                <div className="text-sm font-medium">{player.name}</div>
                <select
                  className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 md:ml-auto md:w-64"
                  value={localRoles[player.id] ?? player.roleId ?? ''}
                  onChange={(event) => setLocalRoles((current) => ({ ...current, [player.id]: event.target.value }))}
                >
                  <option value="">Без роли</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nameRu}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 md:flex-row">
            <SecondaryButton onClick={handleSaveRoles}>Сохранить</SecondaryButton>
            <PrimaryButton onClick={handleIntroNightComplete}>Завершить ночь знакомства</PrimaryButton>
          </div>
        </Card>
      )}

      {stage === 'day' && (
        <div className="space-y-6">
          <Card title={`День ${active.dayNumber} / Голосование`}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Голосующий</label>
                <select
                  className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
                  value={voterId}
                  onChange={(event) => setVoterId(event.target.value)}
                >
                  <option value="">Выберите</option>
                  {alivePlayers.map((player) => (
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
                  {alivePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 md:flex-row">
              <PrimaryButton onClick={handleDayVote}>Добавить голос</PrimaryButton>
              <SecondaryButton onClick={resetVotes}>Сбросить голоса</SecondaryButton>
            </div>
          </Card>

          <Card title="Живые игроки">
            <div className="grid gap-2 md:grid-cols-2">
              {alivePlayers.map((player) => (
                <div key={player.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-sm">
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-xs text-slate-400">Роль: {getRoleLabel(player.roleId)}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Завершить день">
            <PrimaryButton onClick={handleResolveDay}>Завершить день и проверить победу</PrimaryButton>
          </Card>
        </div>
      )}

      {stage === 'night' && (
        <div className="space-y-6">
          <Card title={`Ночь ${active.nightNumber} / Очередь ролей`}>
            <div className="flex flex-wrap gap-2">
              {nightQueue.map((role, index) => (
                <SecondaryButton
                  key={role.id}
                  onClick={() => {
                    setStepIndex(index);
                    setActorId('');
                    setPayload({});
                  }}
                  className={index === stepIndex ? 'border-accent text-accent' : ''}
                >
                  {role.nameRu}
                </SecondaryButton>
              ))}
            </div>
          </Card>

          {stepRole && (
            <Card title={`Шаг: ${stepRole.nameRu}`}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Актёр</label>
                  <select
                    className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
                    value={actorId}
                    onChange={(event) => setActorId(event.target.value)}
                  >
                    <option value="">Выберите актёра</option>
                    {alivePlayers
                      .filter((player) => player.roleId === stepRole.id)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} ({getRoleName(player.roleId)})
                        </option>
                      ))}
                  </select>
                </div>
                {stepRole.actionSchema?.fields.map((field) => {
                  if (field.kind === 'toggle') {
                    return (
                      <label key={field.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(payload[field.key])}
                          onChange={(event) => setPayload((current) => ({ ...current, [field.key]: event.target.checked }))}
                        />
                        {field.label}
                      </label>
                    );
                  }
                  if (field.kind === 'choice') {
                    return (
                      <div key={field.key}>
                        <label className="text-xs text-slate-400">{field.label}</label>
                        <select
                          className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
                          value={String(payload[field.key] ?? '')}
                          onChange={(event) => setPayload((current) => ({ ...current, [field.key]: event.target.value }))}
                        >
                          <option value="">Выберите</option>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  if (field.kind === 'player') {
                    const value = payload[field.key];
                    const selected = Array.isArray(value) ? value : value ? [String(value)] : [];
                    return (
                      <div key={field.key}>
                        <label className="text-xs text-slate-400">{field.label}</label>
                        <select
                          multiple={field.multiple}
                          className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
                          value={selected}
                          onChange={(event) => {
                            const values = Array.from(event.target.selectedOptions).map((option) => option.value);
                            setPayload((current) => ({
                              ...current,
                              [field.key]: field.multiple ? values : values[0] ?? ''
                            }));
                          }}
                        >
                          {alivePlayers
                            .filter((player) => field.allowSelf || player.id !== actorId)
                            .map((player) => (
                              <option key={player.id} value={player.id}>
                                {player.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <div className="mt-4 flex flex-col gap-2 md:flex-row">
                <PrimaryButton onClick={handleNightAction}>Записать действие</PrimaryButton>
                <SecondaryButton onClick={() => setStepIndex((current) => Math.min(nightQueue.length - 1, current + 1))}>
                  Далее
                </SecondaryButton>
              </div>
            </Card>
          )}

          <Card title="Завершить ночь">
            <PrimaryButton onClick={handleResolveNight}>Завершить ночь и проверить победу</PrimaryButton>
          </Card>
        </div>
      )}

      {stage === 'ended' && (
        <Card title="Игра завершена">
          <div className="text-sm text-slate-300">См. журнал для итогов победы и истории.</div>
          <SecondaryButton onClick={() => setStage('players')}>Новая партия</SecondaryButton>
        </Card>
      )}
    </div>
  );
};

export default Flow;
