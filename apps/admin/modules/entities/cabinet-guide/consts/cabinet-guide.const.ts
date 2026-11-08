import type { CabinetGuideCounters } from '../model';

/** Страница путеводителя — в разделе «Маркетплейс», рядом с «Клиентами». */
export const CABINET_GUIDE_PATH = '/marketplace/cabinet-guide';

export const CABINET_GUIDE_TEXT = {
    title: 'Кабинет клиента — путеводитель',
    loading: 'Загрузка…',
    loadError: 'Не удалось загрузить путеводитель',
    checklistTitle: 'Что осталось, чтобы заработало',
    checklistDescription:
        'Проверено по окружению admin (корневой .env общий для pbx, bot и admin) и настройкам в базе. «Проверить вручную» — админка этого не видит, как проверить — в подсказке.',
    checklistSummary: (done: number, total: number): string =>
        `готово ${done} из ${total}`,
    countersTitle: 'Сейчас подключено',
    countersMissing: 'Таблицы кабинета ещё не созданы — примените миграции.',
    linksTitle: 'Смежные страницы',
} as const;

/** Подписи счётчиков в порядке показа. */
export const CABINET_GUIDE_COUNTER_LABELS: ReadonlyArray<
    readonly [keyof CabinetGuideCounters, string]
> = [
    ['portals', 'порталов в базе'],
    ['portalsWithClient', 'привязаны к организации'],
    ['portalsWithOwner', 'с владельцем кабинета'],
    ['members', 'участников кабинетов'],
    ['pending', 'заявок ждут подтверждения'],
    ['telegramBindings', 'чатов Telegram привязано'],
];
