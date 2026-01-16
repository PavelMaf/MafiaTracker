import { useMemo, useState } from 'react';
import { Card, PrimaryButton, SecondaryButton } from '../ui/Controls';
import { useSessionStore } from '../state/store';
import { nightQueue } from '../domain/nightQueue';

const Night = () => {
  const { active, addNightAction, setPhase, setDayNight, addLogEntry } = useSessionStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [actorId, setActorId] = useState('');
  const [payload, setPayload] = useState<Record<string, string | boolean | string[]>>({});

  const queue = useMemo(() => (active ? nightQueue(active) : []), [active]);
  const step = queue[stepIndex];

  if (!active) {
    return <div className="text-sm text-slate-400">Нет активной сессии.</div>;
  }

  const alivePlayers = active.players.filter((player) => player.alive);

  const handleSubmit = async () => {
    if (!step || !actorId) return;
    await addNightAction({
      roleId: step.role.id,
      actorId,
      payload
    });
    setPayload({});
  };

  const nextPhase = async () => {
    await addLogEntry({
      id: `${Date.now()}-night`,
      timestamp: Date.now(),
      phase: 'night',
      dayNumber: active.dayNumber,
      nightNumber: active.nightNumber,
      description: `Ночь ${active.nightNumber} завершена`
    });
    await setPhase('day');
    await setDayNight(active.dayNumber + 1, active.nightNumber);
  };

  return (
    <div className="space-y-6">
      <Card title="Очередь ночи">
        <div className="flex flex-wrap gap-2">
          {queue.map((item, index) => (
            <SecondaryButton
              key={item.role.id}
              onClick={() => {
                setStepIndex(index);
                setActorId(item.actors[0] ?? '');
                setPayload({});
              }}
              className={index === stepIndex ? 'border-accent text-accent' : ''}
            >
              {item.role.nameRu}
            </SecondaryButton>
          ))}
        </div>
      </Card>

      {step ? (
        <Card title={`Шаг: ${step.role.nameRu}`}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Актёр</label>
              <select
                className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm"
                value={actorId}
                onChange={(event) => setActorId(event.target.value)}
              >
                <option value="">Выберите актёра</option>
                {step.actors.map((id) => {
                  const player = active.players.find((p) => p.id === id);
                  return (
                    <option key={id} value={id}>
                      {player?.name ?? '—'}
                    </option>
                  );
                })}
              </select>
            </div>
            {step.role.actionSchema?.fields.map((field) => {
              if (field.kind === 'toggle') {
                return (
                  <label key={field.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(payload[field.key])}
                      onChange={(event) =>
                        setPayload((current) => ({ ...current, [field.key]: event.target.checked }))
                      }
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
                      onChange={(event) =>
                        setPayload((current) => ({ ...current, [field.key]: event.target.value }))
                      }
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
            <PrimaryButton onClick={handleSubmit}>Записать действие</PrimaryButton>
            <SecondaryButton
              onClick={() => setStepIndex((current) => Math.min(queue.length - 1, current + 1))}
            >
              Далее
            </SecondaryButton>
          </div>
        </Card>
      ) : (
        <Card title="Нет ночных действий">Проверьте роли и настройки.</Card>
      )}

      <Card title="Переход к дню">
        <PrimaryButton onClick={nextPhase}>Начать день</PrimaryButton>
      </Card>
    </div>
  );
};

export default Night;
