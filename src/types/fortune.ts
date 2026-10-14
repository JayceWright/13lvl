export type SectorType = 'kush' | 'almost' | 'normal' | 'small' | 'retry' | 'empty' | 'surprise';

export interface Sector {
  id: string;
  title: string;
  shortLabel: string;
  itemDescription: string;
  envelopeNote: string;
  type: SectorType;
  bgGradient: [string, string];
  textColor: string;
  accentBorder?: boolean;
}

export type GameMode = 'drama' | 'shrinking' | 'fair';

export interface RealGiftConfig {
  title: string;
  subtitle: string;
  description: string;
  badgeText: string;
  secretCodeOrTrack: string;
  actionLabel: string;
  actionUrl?: string;
  brotherNote: string;
}

export interface FortuneConfig {
  olderBrotherName: string;
  olderBrotherAge: number;
  youngerBrotherName: string;
  youngerBrotherAge: number;
  cityFrom: string;
  mode: GameMode;
  introMessage: string;
  sectors: Sector[];
  realGift: RealGiftConfig;
}

// 8 exact sectors without slashes:
export const DEFAULT_SECTORS: Sector[] = [
  {
    id: 'sec-1',
    title: 'ЖИРНЫЙ КУШ ★',
    shortLabel: 'КУШ 10К',
    itemDescription: 'Топовый девайс на твой выбор в пределах 10 000 ₽ или в фонд на ПК',
    envelopeNote: 'Главный лот стола. Максимальный куш (10 000 ₽ на девайс или в фонд на ПК), который лежал в полумиллиметре.',
    type: 'kush',
    bgGradient: ['#f59e0b', '#d97706'], // Vibrant Gold/Amber
    textColor: '#0f172a',
    accentBorder: true,
  },
  {
    id: 'sec-2',
    title: 'ПОЧТИ... МИМО',
    shortLabel: 'МИМО',
    itemDescription: 'Записка: «0.5 мм до цели. Почти не считается.»',
    envelopeNote: 'Пустой конверт. От главного приза тебя отделяла толщина ногтя. Но «почти» в зачет не идет.',
    type: 'almost',
    bgGradient: ['#e11d48', '#9f1239'], // Crimson
    textColor: '#ffffff',
  },
  {
    id: 'sec-3',
    title: 'НОРМАЛЬНО',
    shortLabel: 'НОРМ',
    itemDescription: 'Мощный пауэрбанк / клавиатура / мышь',
    envelopeNote: 'Крепкий рабочий девайс на каждый день. Не джекпот, но для сетапа вещь нужная.',
    type: 'normal',
    bgGradient: ['#2563eb', '#1d4ed8'], // Blue
    textColor: '#ffffff',
  },
  {
    id: 'sec-4',
    title: 'НА КАРМАН',
    shortLabel: 'КАРМАН',
    itemDescription: '1 000 ₽ на фастфуд и пачка чипсов',
    envelopeNote: 'Базовый минимум: зайти после школы за шаурмой или пиццей.',
    type: 'small',
    bgGradient: ['#059669', '#047857'], // Emerald
    textColor: '#ffffff',
  },
  {
    id: 'sec-5',
    title: 'ЕЩЁ ПОПЫТКА',
    shortLabel: '+1 ШАНС',
    itemDescription: 'Право на один дополнительный запуск',
    envelopeNote: 'Редкий случай, когда система дает перебросить кости.',
    type: 'retry',
    bgGradient: ['#7c3aed', '#6d28d9'], // Violet
    textColor: '#ffffff',
  },
  {
    id: 'sec-6',
    title: 'ПУСТО',
    shortLabel: 'ПУСТО',
    itemDescription: 'Абсолютный ноль.',
    envelopeNote: 'Ты поставил на удачу и остался с пустыми руками. Классика рандома.',
    type: 'empty',
    bgGradient: ['#334155', '#1e293b'], // Slate
    textColor: '#94a3b8',
  },
  {
    id: 'sec-7',
    title: 'РЯДОМ',
    shortLabel: 'РЯДОМ',
    itemDescription: 'Записка: «Штанга. Снова мимо кассы.»',
    envelopeNote: 'Стрелка прошла по касательной. Удача снова повернулась спиной.',
    type: 'almost',
    bgGradient: ['#be123c', '#881337'], // Ruby
    textColor: '#fecdd3',
  },
  {
    id: 'sec-8',
    title: 'СЮРПРИЗ',
    shortLabel: 'СЮРПРИЗ',
    itemDescription: 'Набор черных высоких носков',
    envelopeNote: 'Суровая взрослая классика на любой праздник.',
    type: 'surprise',
    bgGradient: ['#0891b2', '#0e7490'], // Cyan
    textColor: '#ffffff',
  },
];

export const DEFAULT_CONFIG: FortuneConfig = {
  olderBrotherName: 'Jayce',
  olderBrotherAge: 21,
  youngerBrotherName: 'бро',
  youngerBrotherAge: 13,
  cityFrom: 'На связи',
  mode: 'drama',
  introMessage:
    '«Здорово, бро. Сегодня тебе 13 — детство официально закончилось. На связи Jayce. Дежурную коробку с бантиком и открыткой ты от меня не получишь. Вместо этого мы прямо сейчас проверим, как работает слепой случай в реальной жизни:»',
  sectors: DEFAULT_SECTORS,
  realGift: {
    title: 'ТВОЙ РЕАЛЬНЫЙ ДРОП НА 13 ЛЕТ',
    subtitle: 'Старший брат не оставит тебя с пустым конвертом в твой день.',
    description: '3 000 ₽ на карту прямо сейчас + бюджет на твой девайс, или в фонд на ПК',
    badgeText: 'РАЗБЛОКИРОВАНО',
    secretCodeOrTrack: 'СТАТУС: РАЗБЛОКИРОВАНО / КОД: LEVEL-13-FIRDAVS',
    actionLabel: 'Скопировать код подарка',
    actionUrl: '',
    brotherNote:
      'Колесо и шара всегда подведут на миллиметр, а брат — нет. Этот тест был для того, чтобы ты понял простую вещь: хватит надеяться на авось и забрасывать начатое. В жизни забирает куш тот, кто фигачит, а не тот, кто ждет удачу. Сегодня твой праздник — забирай свой подарок (3 000 ₽ на карту прямо сейчас + бюджет на твой девайс, или в фонд на ПК) и отметь как надо. А за твоими задачами и компом я вернусь на днях. С днюхой, мелкий!',
  },
};

// URL State encoding/decoding
export function encodeConfigToUrl(config: FortuneConfig): string {
  try {
    const json = JSON.stringify(config);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

export function decodeConfigFromUrl(encoded: string): FortuneConfig | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      sectors: parsed.sectors || DEFAULT_SECTORS,
      realGift: { ...DEFAULT_CONFIG.realGift, ...(parsed.realGift || {}) },
    };
  } catch {
    return null;
  }
}
