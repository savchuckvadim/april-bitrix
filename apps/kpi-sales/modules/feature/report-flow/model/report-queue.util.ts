/**
 * Ключи и поллинг queue-флоу отчёта (kpi-report/get + calling-statistic).
 *
 * requestKey = `${from}|${to}|${sortedIds}` — ровно формат эха бэка
 * (нормализованный ISO-период включительно): ответы и WS-события матчатся
 * строковым сравнением, устаревшие (после смены фильтра) отбрасываются.
 *
 * Поллинг обязателен (WS может не подняться) и БЕЗОПАСЕН: бэк дедуплицирует
 * job по ключу, повторный POST лишь читает конверт из кэша.
 */
export type ReportFlowKind = 'report' | 'calling';

export const REPORT_FLOW_POLL_INTERVAL_MS = 7_000;

const currentKeys: Record<ReportFlowKind, string | null> = {
    report: null,
    calling: null,
};

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

/** Пометить ключ активным (все прежние ответы/поллы этого вида устаревают). */
export const setCurrentKey = (kind: ReportFlowKind, key: string): void => {
    currentKeys[kind] = key;
};

export const isCurrentKey = (kind: ReportFlowKind, key: string): boolean =>
    currentKeys[kind] === key;

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
