import { Role } from './models';

export const roles: Role[] = [
  {
    id: 'amur',
    nameRu: 'Амур',
    team: 'villagers',
    balancePoints: 3,
    hasNightAction: true,
    nightOrder: 1,
    actionSchema: {
      description: 'Выберите двух игроков и сделайте их влюблёнными.',
      fields: [
        {
          kind: 'player',
          key: 'targets',
          label: 'Влюблённые',
          multiple: true,
          max: 2
        }
      ]
    }
  },
  {
    id: 'witch',
    nameRu: 'Ведьма',
    team: 'villagers',
    balancePoints: 11,
    hasNightAction: true,
    nightOrder: 4,
    actionSchema: {
      description: 'Одноразовые зелья: лечение жертвы оборотней и отравление.',
      fields: [
        { kind: 'toggle', key: 'healWolfVictim', label: 'Использовать лечебное зелье' },
        { kind: 'player', key: 'poisonTarget', label: 'Цель для отравления', allowSelf: false }
      ]
    }
  },
  {
    id: 'wizard',
    nameRu: 'Волшебник',
    team: 'villagers',
    balancePoints: 9,
    hasNightAction: true,
    nightOrder: 4,
    actionSchema: {
      description: 'Может исцелить жертву оборотней и/или убить любого игрока.',
      fields: [
        { kind: 'toggle', key: 'healWolfVictim', label: 'Исцелить жертву оборотней' },
        { kind: 'player', key: 'killTarget', label: 'Цель для убийства', allowSelf: false }
      ]
    }
  },
  {
    id: 'fool',
    nameRu: 'Дурачок',
    team: 'villagers',
    balancePoints: 1,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'tough',
    nameRu: 'Здоровяк',
    team: 'villagers',
    balancePoints: 4,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'lycan',
    nameRu: 'Ликантроп',
    team: 'villagers',
    balancePoints: 1,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'mason',
    nameRu: 'Масон',
    team: 'villagers',
    balancePoints: 6,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'medium',
    nameRu: 'Медиум',
    team: 'villagers',
    balancePoints: 4,
    hasNightAction: true,
    nightOrder: 5,
    actionSchema: {
      description: 'Получает информацию о выбранном игроке.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Цель для проверки', allowSelf: false }]
    }
  },
  {
    id: 'martyr',
    nameRu: 'Мученица',
    team: 'villagers',
    balancePoints: 1,
    hasNightAction: false,
    nightOrder: null,
    variants: [
      {
        id: 'sacrifice',
        name: 'Жертва днём',
        description: 'После голосования может пожертвовать собой вместо приговорённого.'
      },
      {
        id: 'night',
        name: 'Ночной режим',
        description: 'Использует ночное действие вместо дневной жертвы.'
      }
    ]
  },
  {
    id: 'mayor',
    nameRu: 'Мэр',
    team: 'villagers',
    balancePoints: 5,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'pacifist',
    nameRu: 'Пацифистка',
    team: 'villagers',
    balancePoints: 1,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'prince',
    nameRu: 'Принц',
    team: 'villagers',
    balancePoints: 5,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'instigator',
    nameRu: 'Смутьянка',
    team: 'villagers',
    balancePoints: 2,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'bodyguard',
    nameRu: 'Телохранитель',
    team: 'villagers',
    balancePoints: 3,
    hasNightAction: true,
    nightOrder: 3,
    actionSchema: {
      description: 'Выберите игрока для защиты от убийства.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Защитить', allowSelf: false }]
    }
  },
  {
    id: 'priest',
    nameRu: 'Священник',
    team: 'villagers',
    balancePoints: 3,
    hasNightAction: true,
    nightOrder: 6,
    actionSchema: {
      description: 'Благословение или снятие проклятия.',
      fields: [
        { kind: 'player', key: 'targetId', label: 'Цель', allowSelf: false },
        {
          kind: 'choice',
          key: 'mode',
          label: 'Действие',
          options: [
            { label: 'Благословить', value: 'bless' },
            { label: 'Снять проклятие', value: 'cleanse' }
          ]
        }
      ]
    }
  },
  {
    id: 'hunter',
    nameRu: 'Охотник',
    team: 'villagers',
    balancePoints: 6,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'ghost',
    nameRu: 'Призрак',
    team: 'villagers',
    balancePoints: 1,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'elder',
    nameRu: 'Старик',
    team: 'villagers',
    balancePoints: 0,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'plague',
    nameRu: 'Чумная',
    team: 'villagers',
    balancePoints: 3,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'psychic',
    nameRu: 'Экстрасенс',
    team: 'villagers',
    balancePoints: 3,
    hasNightAction: true,
    nightOrder: 2,
    actionSchema: {
      description: 'Проверяет цель и её соседей слева/справа.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Цель', allowSelf: false }]
    }
  },
  {
    id: 'seer',
    nameRu: 'Видица',
    team: 'villagers',
    balancePoints: 7,
    hasNightAction: true,
    nightOrder: 2,
    actionSchema: {
      description: 'Проверяет команду или роль (в зависимости от настроек).',
      fields: [{ kind: 'player', key: 'targetId', label: 'Цель', allowSelf: false }]
    }
  },
  {
    id: 'seer_apprentice',
    nameRu: 'Ученица Провидца',
    team: 'villagers',
    balancePoints: 2,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'werewolf',
    nameRu: 'Оборотни (охота)',
    team: 'werewolves',
    balancePoints: -6,
    hasNightAction: true,
    nightOrder: 7,
    actionSchema: {
      description: 'Выберите жертву охоты оборотней.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Жертва', allowSelf: false }]
    }
  },
  {
    id: 'wolf_cub',
    nameRu: 'Волчонок',
    team: 'werewolves',
    balancePoints: -8,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'lone_wolf',
    nameRu: 'Одиночка',
    team: 'werewolves',
    balancePoints: -5,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'sorceress',
    nameRu: 'Колдунья',
    team: 'werewolves',
    balancePoints: -3,
    hasNightAction: true,
    nightOrder: 5,
    actionSchema: {
      description: 'Особая проверка для провидцев.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Цель', allowSelf: false }]
    }
  },
  {
    id: 'cursed',
    nameRu: 'Проклятый',
    team: 'villagers',
    balancePoints: -3,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'lackey',
    nameRu: 'Прихвостень',
    team: 'werewolves',
    balancePoints: -6,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'doppelganger',
    nameRu: 'Доппельгангер',
    team: 'neutral',
    balancePoints: -2,
    hasNightAction: true,
    nightOrder: 1,
    actionSchema: {
      description: 'Выберите игрока для копирования роли после его смерти.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Цель', allowSelf: false }]
    }
  },
  {
    id: 'vampire',
    nameRu: 'Вампир',
    team: 'vampires',
    balancePoints: -8,
    hasNightAction: true,
    nightOrder: 7,
    actionSchema: {
      description: 'Выберите жертву вампиров.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Жертва', allowSelf: false }]
    }
  },
  {
    id: 'cult_leader',
    nameRu: 'Глава секты',
    team: 'sect',
    balancePoints: 1,
    hasNightAction: true,
    nightOrder: 6,
    actionSchema: {
      description: 'Обращает игрока в сектанты.',
      fields: [{ kind: 'player', key: 'targetId', label: 'Цель', allowSelf: false }]
    }
  },
  {
    id: 'tanner',
    nameRu: 'Дубильщик',
    team: 'neutral',
    balancePoints: 0,
    hasNightAction: false,
    nightOrder: null
  },
  {
    id: 'bandit',
    nameRu: 'Бандит',
    team: 'neutral',
    balancePoints: 0,
    hasNightAction: false,
    nightOrder: null
  }
];

export const roleMap = new Map(roles.map((role) => [role.id, role]));
