import { useEffect, useState } from 'react';
import { Card, PrimaryButton } from '../ui/Controls';
import { useSessionStore } from '../state/store';

const SettingsPage = () => {
  const { active, updateSettings } = useSessionStore();
  const [local, setLocal] = useState(active?.settings);

  useEffect(() => {
    setLocal(active?.settings);
  }, [active]);

  if (!active || !local) {
    return <div className="text-sm text-slate-400">Нет активной сессии.</div>;
  }

  const handleSave = async () => {
    await updateSettings(local);
  };

  return (
    <div className="space-y-6">
      <Card title="Правила партии">
        <div className="space-y-4 text-sm">
          <div>
            <label className="text-xs text-slate-400">Раскрытие при смерти</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3"
              value={local.revealOnDeath}
              onChange={(event) => setLocal({ ...local, revealOnDeath: event.target.value as typeof local.revealOnDeath })}
            >
              <option value="none">Не раскрывать</option>
              <option value="team">Показывать команду</option>
              <option value="role">Показывать роль</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.enableVampires}
              onChange={(event) => setLocal({ ...local, enableVampires: event.target.checked })}
            />
            Вампиры
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.enableSect}
              onChange={(event) => setLocal({ ...local, enableSect: event.target.checked })}
            />
            Секта
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.enableObereg}
              onChange={(event) => setLocal({ ...local, enableObereg: event.target.checked })}
            />
            Оберег (карта)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.sheriffDoubleVote}
              onChange={(event) => setLocal({ ...local, sheriffDoubleVote: event.target.checked })}
            />
            Голос мэра x2
          </label>
          <div>
            <label className="text-xs text-slate-400">Мученица</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3"
              value={local.martyrMode}
              onChange={(event) => setLocal({ ...local, martyrMode: event.target.value as typeof local.martyrMode })}
            >
              <option value="sacrifice">Жертвует собой днём</option>
              <option value="night">Ночное действие</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Телохранитель</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3"
              value={local.bodyguardRepeatProtect}
              onChange={(event) =>
                setLocal({ ...local, bodyguardRepeatProtect: event.target.value as typeof local.bodyguardRepeatProtect })
              }
            >
              <option value="disallow">Нельзя защищать одного игрока подряд</option>
              <option value="allow">Можно защищать повторно</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Провидцы</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3"
              value={local.seerDetectMode}
              onChange={(event) => setLocal({ ...local, seerDetectMode: event.target.value as typeof local.seerDetectMode })}
            >
              <option value="team">Показывать команду</option>
              <option value="role">Показывать роль</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Волчонок</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3"
              value={local.wolfCubRevengeMode}
              onChange={(event) =>
                setLocal({ ...local, wolfCubRevengeMode: event.target.value as typeof local.wolfCubRevengeMode })
              }
            >
              <option value="doubleHunt">Двойная охота после смерти</option>
              <option value="sacrifice">Оборотни могут съесть волчонка</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Вампиры: тайминг</label>
            <select
              className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3"
              value={local.vampireKillTiming}
              onChange={(event) =>
                setLocal({ ...local, vampireKillTiming: event.target.value as typeof local.vampireKillTiming })
              }
            >
              <option value="dayAfterVote">Смерть после дневного голосования</option>
              <option value="immediate">Сразу ночью</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={local.cultLeaderInherit}
              onChange={(event) => setLocal({ ...local, cultLeaderInherit: event.target.checked })}
            />
            Секта: наследование лидерства
          </label>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={handleSave}>Сохранить правила</PrimaryButton>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
