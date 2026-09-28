/*
 * Подписи кодов самоотчёта менеджера (item'ы поля «Тип события» списка
 * показателей CRM) и причин, по которым у типа звонка нет факта. Коды —
 * из карты алфавитов бэка (ai-analytics-event-map.const.ts) и справочника
 * списка; сырой код в интерфейс не попадает никогда.
 */

/** Код события списка показателей → название события по справочнику CRM. */
export const AI_KPI_EVENT_LABELS: Record<string, string> = {
    xo: 'Холодный звонок',
    call: 'Звонок',
    come_call: 'Входящий звонок',
    site: 'Заявка с сайта',
    presentation: 'Презентация',
    presentation_uniq: 'Уникальная презентация',
    presentation_contact_uniq: 'Презентация по контакту',
    call_in_progress: 'Звонок по решению',
    call_in_money: 'Звонок по оплате',
    ev_success: 'Успех',
    ev_fail: 'Отказ',
    info: 'Информация',
    seminar: 'Приглашение на семинар',
    refine: 'Доработка',
};

/** Подпись незнакомого кода — нейтральная, без самого кода. */
export const AI_KPI_EVENT_FALLBACK = 'Показатель CRM';

export const aiKpiEventLabel = (code: string): string =>
    AI_KPI_EVENT_LABELS[code] ?? AI_KPI_EVENT_FALLBACK;

/** Причины отсутствия факта по типу (kpiReason карты алфавитов). */
export const AI_KPI_REASON_LABELS: Record<string, string> = {
    'refine-mapped-to-call': 'доработка считается как звонок',
    'other-share-in-meta': 'доля «прочего» — в сводке',
    'irrelevant-share-in-meta': 'доля нерелевантных — в сводке',
};

/** Префикс причины «события нет в списке показателей портала»: kpi-item-missing:{code}. */
const AI_KPI_ITEM_MISSING_PREFIX = 'kpi-item-missing:';

export const AI_KPI_REASON_FALLBACK = 'факт по типу не считается';

/**
 * Причина отсутствия факта по-русски: известный код — по словарю,
 * «kpi-item-missing:{code}» — «в списке событий CRM нет «Звонок по оплате»»,
 * пусто — null, незнакомый код — нейтральная подпись.
 */
export const aiKpiReasonLabel = (
    reason: string | null | undefined,
): string | null => {
    if (!reason) return null;
    const known = AI_KPI_REASON_LABELS[reason];
    if (known) return known;
    if (reason.startsWith(AI_KPI_ITEM_MISSING_PREFIX)) {
        const label =
            AI_KPI_EVENT_LABELS[reason.slice(AI_KPI_ITEM_MISSING_PREFIX.length)];
        return label
            ? `в списке событий CRM нет «${label}»`
            : 'события нет в списке CRM';
    }
    return AI_KPI_REASON_FALLBACK;
};
