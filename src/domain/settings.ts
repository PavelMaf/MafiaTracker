import { Settings } from './models';

export const defaultSettings: Settings = {
  revealOnDeath: 'team',
  enableVampires: false,
  enableSect: false,
  enableObereg: false,
  sheriffDoubleVote: true,
  martyrMode: 'sacrifice',
  bodyguardRepeatProtect: 'disallow',
  seerDetectMode: 'team',
  wolfCubRevengeMode: 'doubleHunt',
  vampireKillTiming: 'dayAfterVote',
  cultLeaderInherit: false
};

export const settingsDescriptions: Record<keyof Settings, string> = {
  revealOnDeath: 'Раскрытие роли при смерти',
  enableVampires: 'Вампиры включены',
  enableSect: 'Секта включена',
  enableObereg: 'Оберег включён',
  sheriffDoubleVote: 'Голос мэра x2',
  martyrMode: 'Мученица: базовый режим',
  bodyguardRepeatProtect: 'Телохранитель: повторная защита',
  seerDetectMode: 'Провидцы: режим проверки',
  wolfCubRevengeMode: 'Волчонок: режим после смерти',
  vampireKillTiming: 'Вампиры: тайминг убийства',
  cultLeaderInherit: 'Секта: наследование лидерства'
};
