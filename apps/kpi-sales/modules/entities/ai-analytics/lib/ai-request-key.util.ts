/**
 * Ключ запроса секции AI-аналитики — по нему thunks отсекают дубли и
 * устаревшие ответы. Форма:
 * `${domain}|${requesterUserId}|${from}|${to}|${sortedIds}[|${callType}|${layout}]`.
 * Пульс и повестка не принимают фильтров (периметр считает сервер по
 * requester'у) — для них период и менеджеры пустые; overview/attention
 * передают период и состав; by-type добавляет тип и раскладку.
 */
export interface AiRequestScope {
    domain: string;
    requesterUserId: string;
    from?: string;
    to?: string;
    managerIds?: number[];
    /** Срез by-type: тип звонка (или objections). */
    callType?: string;
    /** Срез by-type: раскладка wide | long. */
    layout?: string;
}

export const buildAiRequestKey = (scope: AiRequestScope): string => {
    const ids = [...(scope.managerIds ?? [])].sort((a, b) => a - b).join('_');
    const parts = [
        scope.domain,
        scope.requesterUserId,
        scope.from ?? '',
        scope.to ?? '',
        ids,
    ];
    if (scope.callType) parts.push(scope.callType, scope.layout ?? '');
    return parts.join('|');
};
