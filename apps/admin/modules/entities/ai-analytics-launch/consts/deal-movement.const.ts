/**
 * Карточка «Движение сделок» на странице AI портала: коды ответов бэка
 * (`libs/sales-ai-analytics/src/contracts/deal-movement-*.types.ts`),
 * адреса ручек и тексты. Коды на экран не выводятся — только подписи.
 */

/** Статусы сделки — как в контракте бэка. */
export const DEAL_MOVEMENT_STATUSES = [
    'rolled_back',
    'stuck',
    'at_risk',
    'moving',
] as const;

/** Режимы прогона: подсчёт без сохранения и счёт с сохранением. */
export const DEAL_MOVEMENT_RUN_MODES = ['dry-run', 'count'] as const;

/** Фазы прогона — как в контракте бэка. */
export const DEAL_MOVEMENT_RUN_PHASES = [
    'started',
    'deals',
    'history',
    'calls',
    'evaluated',
    'saved',
    'done',
    'failed',
] as const;

/** Ручки админки (пока руками, без сгенерированного клиента). */
export const DEAL_MOVEMENT_URL = {
    run: '/api/admin/ai-analytics/deal-movement',
    status: '/api/admin/ai-analytics/deal-movement-status',
} as const;

/** Страница настроек портала, раскрытая на категории «Движение сделок». */
export const dealMovementSettingsHref = (portalId: number): string =>
    `/portal/${portalId}/app-settings#group-deal_movement`;

/** Карточка сделки в Битриксе портала. */
export const dealMovementDealHref = (domain: string, dealId: string): string =>
    `https://${domain}/crm/deal/details/${dealId}/`;

/** Прогон без обновления дольше этого — считается оборванным, не «идёт». */
export const DEAL_MOVEMENT_RUNNING_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Сколько смен статуса показывать в карточке; остальное — «и ещё N». */
export const DEAL_MOVEMENT_CHANGES_SHOWN = 30;

/** Порядок статусов в строке счёта: от спокойных к тревожным. */
export const DEAL_MOVEMENT_STATUS_ORDER = [
    'moving',
    'stuck',
    'rolled_back',
    'at_risk',
] as const;

export const DEAL_MOVEMENT_STATUS_TITLE = {
    moving: 'Движется',
    stuck: 'Застряла',
    rolled_back: 'Откатилась',
    at_risk: 'Под риском',
} as const satisfies Record<(typeof DEAL_MOVEMENT_STATUSES)[number], string>;

export const DEAL_MOVEMENT_PHASE_TITLE = {
    started: 'начат',
    deals: 'читает открытые сделки',
    history: 'читает историю стадий',
    calls: 'собирает разборы звонков',
    evaluated: 'считает статусы',
    saved: 'сохраняет итог',
    done: 'закончен',
    failed: 'не удался',
} as const satisfies Record<(typeof DEAL_MOVEMENT_RUN_PHASES)[number], string>;

export const DEAL_MOVEMENT_MODE_TITLE = {
    'dry-run': 'Подсчёт без сохранения',
    count: 'Счёт с сохранением',
} as const satisfies Record<(typeof DEAL_MOVEMENT_RUN_MODES)[number], string>;

/** Кто поставил прогон: код бэка → подпись; незнакомый — без подписи. */
export const DEAL_MOVEMENT_REQUESTER_TITLE: Readonly<Record<string, string>> = {
    nightly: 'ночью по расписанию',
    admin: 'из админки',
};

export const DEAL_MOVEMENT_TEXT = {
    title: 'Движение сделок',
    description:
        'Каждую ночь все открытые сделки воронки «ОП Основная» получают ' +
        'статус: движется, застряла, откатилась или под риском. Статус ' +
        'считает код по стадиям, разобранным звонкам и договорённостям из ' +
        'них. Сейчас это только подсчёт: в сделки ничего не пишется, ' +
        'сотрудникам ничего не уходит.',
    enabled:
        'Ночной счёт включён: портал считается каждую ночь с 2 до 5 часов ' +
        'по его времени.',
    disabled:
        'Ночной счёт на портале выключен. Включить: «Настройки приложений» → ' +
        '«Движение сделок» → «Включено». Кнопки ниже работают и без этого.',
    settingsLink: 'Открыть настройки движения сделок',
    lastCountTitle: 'Последний сохранённый счёт',
    noSnapshot:
        'Сохранённого счёта ещё нет — нажмите «Посчитать сейчас» или ' +
        'дождитесь ночи.',
    baselineBadge: 'точка отсчёта',
    baselineHint:
        'Прошлого счёта не было или он старше трёх суток — смены статуса в ' +
        'этот раз не считались.',
    warningsTitle: 'Предупреждения',
    changesTitle: 'Сменили статус',
    noChanges: 'В этом счёте ни одна сделка не сменила статус.',
    runTitle: 'Последний прогон',
    noRun: 'За последние две недели прогонов не было.',
    progressHint: 'Обновляется раз в 30 секунд, пока идёт прогон.',
    runInProgress: 'Идёт прогон — дождитесь окончания.',
    notAvailable:
        'Очередь не подключена в этой сборке — запуск недоступен, попросите ' +
        'разработчика.',
    count: {
        button: 'Посчитать',
        what:
            'Прочитает все открытые сделки воронки сейчас и посчитает статусы. ' +
            'Ничего не сохраняет: итог появится в строке «Последний прогон».',
        confirm:
            'Подсчёт прочитает все открытые сделки воронки «ОП Основная» прямо ' +
            'сейчас — это запросы к Битриксу портала. Ничего не сохраняется. ' +
            'В сделки ничего не пишется, сотрудникам ничего не уходит.',
    },
    run: {
        button: 'Посчитать сейчас',
        what:
            'Внеочередной счёт: состояние по сделкам и итог дня сохранятся, ' +
            'сегодняшней ночью этот портал уже не будет посчитан.',
        confirm:
            'Счёт пройдёт сейчас, а не ночью: состояние по сделкам и итог дня ' +
            'сохранятся, сегодняшней ночью портал повторно не считается. Это ' +
            'запросы к Битриксу портала в рабочее время. В сделки ничего не ' +
            'пишется, сотрудникам ничего не уходит.',
    },
} as const;
