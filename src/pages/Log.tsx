import { Card, PrimaryButton, SecondaryButton } from '../ui/Controls';
import { useSessionStore } from '../state/store';
import { exportSession } from '../storage/persistence';

const Log = () => {
  const { active, truncateEvents, panic } = useSessionStore();

  if (!active) {
    return <div className="text-sm text-slate-400">Нет активной сессии.</div>;
  }

  const handleExport = async () => {
    const payload = await exportSession(active.id);
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${active.name || 'session'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card title="Журнал событий">
        <div className="space-y-2 text-sm">
          {active.log.length === 0 && <div className="text-slate-400">Записей нет.</div>}
          {active.log.map((entry) => (
            <div key={entry.id} className="rounded border border-slate-800 bg-slate-950/40 p-2">
              <div className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</div>
              <div className="font-semibold">{entry.description}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="История событий">
        <div className="space-y-2 text-xs">
          {active.events.map((event, index) => (
            <div key={`${event.type}-${index}`} className="flex items-center justify-between">
              <div>
                #{index} {event.type}
              </div>
              <SecondaryButton onClick={() => truncateEvents(index)}>Откатить до</SecondaryButton>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Экспорт">
        <PrimaryButton onClick={handleExport}>Экспорт JSON</PrimaryButton>
      </Card>

      <Card title="Кнопка паники">
        <SecondaryButton onClick={panic}>Восстановить из последнего снимка</SecondaryButton>
      </Card>
    </div>
  );
};

export default Log;
