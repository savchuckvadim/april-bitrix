/**
 * Ключи и поллинг queue-флоу отчёта (kpi-report/get + calling-statistic).
 *
 * requestKey = `${from}|${to}|${sortedIds}` — ровно формат эха бэка
 * (нормализованный ISO-период включительно): ответы и WS-события матчатся
 * строковым сравнением, устаревшие (после смены фильтра) отбрасываются.
 *
 * Поллинг обязателен (WS может не подняться) и БЕЗОПАСЕН: бэк дедуплицирует
 * job по ключу, повторный POST лишь читает конверт из кэша.
 *
 * Кроме текущего ключа здесь же память «для какого ключа источник уже
 * загружен» (loadedKeys): по ней запросы «по необходимости»
 * (ensureReportData) не просят то, что уже есть. Отметку ставит успешный
 * ответ — и запроса, и WS-события готовности; ошибка расчёта не ставит.
 */
export type ReportFlowKind = 'report' | 'calling';

export const REPORT_FLOW_POLL_INTERVAL_MS = 7_000;

const currentKeys: Record<ReportFlowKind, string | null> = {
    report: null,
    calling: null,
};

/** Ключ, для которого источник успешно загружен (null — ещё нет). */
const loadedKeys: Record<ReportFlowKind, string | null> = {
    report: null,
    calling: null,
};

/**
 * Сохранённый фильтр применён: действующий фильтр установился, и запросы
 * «по необходимости» разрешены. До этого вкладка может меняться (настройки
 * интерфейса, ссылка `?tab=`), а фильтр ещё стартовый — запрос по нему ушёл
 * бы в очередь мусорным и тут же устарел.
 */
let savedFilterApplied = false;

const pollTimers: Record<ReportFlowKind, ReturnType<typeof setTimeout> | null> =
    {
        report: null,
        calling: null,
    };

export const buildReportFlowRequestKey = (
    from: string,
    to: string,
    users: readonly { ID?: string | number }[],
): string =>
    `${from}|${to}|${users
        .map(user => Number(user.ID))
        .filter(id => Number.isFinite(id) && id > 0)
        .sort((a, b) => a - b)
        .join('_')}`;

/**
 * Ключ запроса по действующему фильтру: период и сотрудники (выбранные, а
 * при пустом выборе — все видимые, как в самих запросах). null — запрашивать
 * нечего: период не задан или сотрудников нет.
 */
export const resolveReportFlowRequestKey = (
    date: { from: string; to: string },
    current: readonly { ID?: string | number }[],
    visible: readonly { ID?: string | number }[],
): string | null => {
    const users = current.length ? current : visible;
    if (!date.from || !date.to || !users.length) return null;
    return buildReportFlowRequestKey(date.from, date.to, users);
};

/** Пометить ключ активным (все прежние ответы/поллы этого вида устаревают). */
export const setCurrentKey = (kind: ReportFlowKind, key: string): void => {
    currentKeys[kind] = key;
};

export const isCurrentKey = (kind: ReportFlowKind, key: string): boolean =>
    currentKeys[kind] === key;

/** Источник успешно загружен для ключа (ответ запроса или WS-событие готовности). */
export const markLoadedKey = (kind: ReportFlowKind, key: string): void => {
    loadedKeys[kind] = key;
};

export const isLoadedKey = (kind: ReportFlowKind, key: string): boolean =>
    loadedKeys[kind] === key;

/**
 * Нужно ли запрашивать источник для ключа: он ещё не загружен для него и
 * не запрашивается прямо сейчас (isLoading — флаг загрузки источника в
 * сторе; без совпадения ключа он относится к другому, устаревшему запросу).
 */
export const needsRequest = (
    kind: ReportFlowKind,
    key: string,
    isLoading: boolean,
): boolean =>
    !isLoadedKey(kind, key) && !(isCurrentKey(kind, key) && isLoading);

/** Сохранённый фильтр применён — запросы «по необходимости» разрешены. */
export const markSavedFilterApplied = (): void => {
    savedFilterApplied = true;
};

export const isSavedFilterApplied = (): boolean => savedFilterApplied;

export const clearPoll = (kind: ReportFlowKind): void => {
    const timer = pollTimers[kind];
    if (timer) clearTimeout(timer);
    pollTimers[kind] = null;
};

/**
 * Один отложенный повторный POST; выполняется только если ключ всё ещё
 * актуален (смена фильтра отменяет поллинг устаревшего ключа).
 */
export const schedulePoll = (
    kind: ReportFlowKind,
    key: string,
    poll: () => void,
): void => {
    clearPoll(kind);
    pollTimers[kind] = setTimeout(() => {
        pollTimers[kind] = null;
        if (isCurrentKey(kind, key)) poll();
    }, REPORT_FLOW_POLL_INTERVAL_MS);
};

/** Сбросить всю память флоу (ключи, отметки, таймеры) — для тестов. */
export const resetReportFlowMemory = (): void => {
    for (const kind of ['report', 'calling'] as const) {
        currentKeys[kind] = null;
        loadedKeys[kind] = null;
        clearPoll(kind);
    }
    savedFilterApplied = false;
};
