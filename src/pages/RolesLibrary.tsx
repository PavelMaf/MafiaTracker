import { useMemo, useState } from 'react';
import { Card, TextInput } from '../ui/Controls';
import { roles } from '../domain/roles';

const RolesLibrary = () => {
  const [query, setQuery] = useState('');
  const [hideSpoilers, setHideSpoilers] = useState(false);

  const filtered = useMemo(() => {
    return roles.filter((role) => role.nameRu.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="space-y-6">
      <Card title="Поиск ролей">
        <div className="space-y-3">
          <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hideSpoilers}
              onChange={(event) => setHideSpoilers(event.target.checked)}
            />
            Без спойлеров (скрыть описание)
          </label>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((role) => (
          <Card key={role.id} title={role.nameRu}>
            <div className="text-xs text-slate-400">Команда: {role.team}</div>
            <div className="text-xs text-slate-400">Баланс: {role.balancePoints}</div>
            {!hideSpoilers && role.actionSchema && (
              <div className="mt-2 text-sm text-slate-200">{role.actionSchema.description}</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolesLibrary;
