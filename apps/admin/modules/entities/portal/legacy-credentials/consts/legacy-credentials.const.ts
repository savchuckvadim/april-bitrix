/** Тексты карточки «Вебхук Битрикса в online». */
export const LEGACY_CREDENTIALS_TEXT = {
    title: 'Вебхук Битрикса в online (Laravel)',
    description:
        'С этим вебхуком бэки ходят в Битрикс портала: отчёты, event-sales, установка. ' +
        'Значение шифрует сам Laravel, после записи слепок портала в бэках сбрасывается.',
    loading: 'Загрузка…',
    loadError: 'Не удалось получить креды портала из online.',
    noDomain: 'У портала не указан домен.',
    currentKey: 'Ключ (key)',
    currentHook: 'Вебхук (C_REST_WEB_HOOK_URL)',
    mismatch: 'Ключ и вебхук в online различаются. Сохранение выровняет оба.',
    reveal: 'Показать',
    hide: 'Скрыть',
    inputLabel: 'Новый вебхук',
    inputPlaceholder: 'https://portal.bitrix24.ru/rest/1/abc123/ или rest/1/abc123',
    willSave: 'Запишется как',
    invalidFormat: 'Нужен формат rest/<ID пользователя>/<код>.',
    foreignDomain: (pasted: string, domain: string) =>
        `Вебхук от ${pasted}, а портал ${domain}.`,
    unchanged: 'В online уже записан этот вебхук.',
    noNumber: 'У портала нет номера (number), online не примет запись.',
    secrets: {
        follow: 'Client ID и secret совпадают со старым ключом и обновятся вместе с ним.',
        keep: 'Client ID и secret останутся без изменений.',
        mixed: 'Client ID и secret: то, что совпадает со старым ключом, обновится, остальное останется.',
    },
    save: 'Записать в online',
    saving: 'Запись…',
    saved: 'Вебхук записан в online',
    savedDescription: 'Слепок портала в бэках сброшен, новый ключ работает сразу.',
    saveError: 'Не удалось записать вебхук в online',
} as const;
