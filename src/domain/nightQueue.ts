import { Role } from './models';
import { roleMap, roles } from './roles';
import { SessionState } from './models';

export interface NightStep {
  role: Role;
  actors: string[];
}

export const nightQueue = (state: SessionState): NightStep[] => {
  const alive = state.players.filter((player) => player.alive);
  const steps: NightStep[] = [];

  const addRoleStep = (roleId: string, actors: string[]) => {
    const role = roleMap.get(roleId);
    if (!role || !role.hasNightAction || role.nightOrder === null) return;
    steps.push({ role, actors });
  };

  const rolesWithActions = roles.filter((role) => role.hasNightAction && role.nightOrder !== null);
  rolesWithActions.forEach((role) => {
    if (role.id === 'werewolf') return;
    if (role.id === 'vampire' && !state.settings.enableVampires) return;
    if (role.id === 'cult_leader' && !state.settings.enableSect) return;
    const actors = alive.filter((player) => player.roleId === role.id).map((player) => player.id);
    if (actors.length) {
      steps.push({ role, actors });
    }
  });

  const wolfActors = alive.filter((player) => player.team === 'werewolves').map((player) => player.id);
  if (wolfActors.length) {
    addRoleStep('werewolf', wolfActors);
  }

  return steps.sort((a, b) => (a.role.nightOrder ?? 0) - (b.role.nightOrder ?? 0));
};
