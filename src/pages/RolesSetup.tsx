import { useMemo, useState } from 'react';
import { Card, PrimaryButton, SecondaryButton } from '../ui/Controls';
import { roles, roleMap } from '../domain/roles';
import { useSessionStore } from '../state/store';

const RolesSetup = () => {
  const { active, assignRoles } = useSessionStore();
  const [localRoles, setLocalRoles] = useState<Record<string, string>>({});

  const players = active?.players ?? [];

  const balance = useMemo(() => {
    return players.reduce((sum, player) => {
      const roleId = localRoles[player.id] ?? player.roleId;
      const role = roleId ? roleMap.get(roleId) : null;
      return sum + (role?.balancePoints ?? 0);
    }, 0);
  }, [players, localRoles]);

  if (!active) {
    return <div className="text-sm text-slate-400">Нет активной сессии.</div>;
  }

  const handleSave = async () => {
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

  const handleResetLocal = () => setLocalRoles({});

  return (
    <div className="space-y-6">
      <Card title="Баланс ролей">
        <div className="text-sm">Сумма очков: {balance}</div>
      </Card>

      <Card title="Раздача ролей">
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center"
            >
              <div className="text-sm font-medium">{player.name}</div>
              <select
                className="min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 md:ml-auto md:w-64"
                value={localRoles[player.id] ?? player.roleId ?? ''}
                onChange={(event) =>
                  setLocalRoles((current) => ({ ...current, [player.id]: event.target.value }))
                }
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
          <PrimaryButton onClick={handleSave}>Сохранить раздачу</PrimaryButton>
          <SecondaryButton onClick={handleResetLocal}>Сбросить выбор</SecondaryButton>
        </div>
      </Card>
    </div>
  );
};

export default RolesSetup;
