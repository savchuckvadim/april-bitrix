
/** Опрос состояния, пока PDF собирается (сборка с моделью — минуты). */
export const OWNER_REPORT_EXPORT_POLL_MS = 5_000;

/** Как брать отчёт: готовый снимок или собрать заново. */
export const OWNER_REPORT_EXPORT_MODES = {
    ready: 'ready',
    rebuild: 'rebuild',
} as const;
export type OwnerReportExportMode =
    (typeof OWNER_REPORT_EXPORT_MODES)[keyof typeof OWNER_REPORT_EXPORT_MODES];

export const OWNER_REPORT_EXPORT_TEXT = {
    title: 'Отчёт собственнику: PDF',
    description:
        'Управленческий отчёт по отделу продаж за закрытый период: собирается на сервере и сразу скачивается. Клиенту ничего не отправляется.',
    kind: 'Вид периода',
    kindHint:
        'Квартал, полугодие и год появляются, когда у портала накопилось 3, 6 и 12 месяцев разборов.',
    period: 'Период',
    mode: 'Отчёт',
    modes: {
        ready: 'Готовый, если есть',
        rebuild: 'Собрать заново',
    },
    modeHint:
        '«Собрать заново» — после переразбора звонков: иначе придёт отчёт, собранный до него.',
    start: 'Сформировать PDF',
    download: 'Скачать ещё раз',
    status: {
        queued: 'В очереди…',
        processing: 'Собираю отчёт — обычно до пары минут…',
        ready: 'PDF готов',
        error: 'Не получилось',
    },
    readyAt: (size: string) => `PDF готов, ${size}. Файл хранится сутки.`,
    noDomain: 'У портала нет домена — отчёт не собрать.',
    downloadError: 'Файл не скачался',
} as const;
