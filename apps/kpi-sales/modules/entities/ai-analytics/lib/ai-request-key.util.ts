/**
 * Ключ запроса секции AI-аналитики — по нему thunks отсекают дубли и
 * устаревшие ответы. Форма:
 * `${domain}|${requesterUserId}|${from}|${to}|${sortedIds}[|${callType}|${layout}][|#${extra…}]`.
 * Пульс и повестка не принимают фильтров (периметр считает сервер по
 * requester'у) — для них период и менеджеры пустые; overview/attention
 * передают период и состав; by-type добавляет тип и раскладку; секции
 * с собственными параметрами (план дня, стиль, слепая оценка, «Как
 * считаем») кладут их в `extra` после маркера `#`.
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
    /** Параметры секции вне общего периметра (managerId, дата, endpoint…). */
    extra?: readonly AiRequestKeyPart[];
}

/** Часть ключа: пустое значение (undefined | null) кодируется пустой строкой. */
export type AiRequestKeyPart = string | number | null | undefined;

export const buildAiRequestKey = (scope: AiRequestScope): string => {
    const ids = [...(scope.managerIds ?? [])].sort((a, b) => a - b).join('_');
    const parts: string[] = [
        scope.domain,
        scope.requesterUserId,
        scope.from ?? '',
        scope.to ?? '',
        ids,
    ];
    if (scope.callType) parts.push(scope.callType, scope.layout ?? '');
    if (scope.extra?.length) {
        parts.push('#', ...scope.extra.map(part => String(part ?? '')));
    }
    return parts.join('|');
};
