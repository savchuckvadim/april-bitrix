/**
 * КУДА ПРИВЯЗАТЬ НОВЫЙ КОНТАКТ И НА КОГО ЕГО ЗАПИСАТЬ.
 *
 * Решение владельца 25.10.2026: контакт, заведённый в «Звонках», всегда
 * попадает в компанию клиента и в сделку работы, а ответственный у него —
 * тот же, что у сделки (контакты идут за ответственным сделки — правило
 * 22.10, его же держит автоматизация портала):
 *  - открыто из сделки — компания этой сделки и эта сделка;
 *  - открыто из компании — компания и её открытая «ОП Основная» (своя, а
 *    своей нет — самая свежая из открытых);
 *  - лид — контакт лида, ответственный — ответственный лида.
 * Сделки нет — ответственный тот, за кого идёт работа (в режиме
 * руководителя — сотрудник, иначе сам пользователь).
 */

/** Сделка, как её отдаёт crm.deal.get / crm.deal.list (нужные поля). */
export interface ContactDealRow {
    ID: number | string;
    ASSIGNED_BY_ID?: number | string | null;
    DATE_MODIFY?: string | null;
}

export interface NewContactTarget {
    /** Компания клиента; null — неизвестна (сделка без компании, лид). */
    companyId: number | null;
    /** Сделка, в которую добавить контакт; null — сделки нет. */
    dealId: number | null;
    /** Ответственный контакта; null — оставить как решит Битрикс. */
    responsibleId: number | null;
}

const positiveId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const modifiedAt = (row: ContactDealRow): number => {
    const time = Date.parse(String(row.DATE_MODIFY ?? ''));
    return Number.isFinite(time) ? time : 0;
};

/**
 * Сделка «ОП Основная» для контакта, заведённого из компании: своя
 * (того, за кого идёт работа), а своей нет — самая свежая из открытых.
 * Свежесть — по последнему изменению, при равенстве — больший ID.
 */
export function pickBaseDealForContact(
    rows: readonly ContactDealRow[],
    ownerId: number | null,
): ContactDealRow | null {
    const byFreshness = rows
        .filter(row => positiveId(row.ID) !== null)
        .sort(
            (a, b) =>
                modifiedAt(b) - modifiedAt(a) || Number(b.ID) - Number(a.ID),
        );
    const own = ownerId
        ? byFreshness.find(row => positiveId(row.ASSIGNED_BY_ID) === ownerId)
        : undefined;
    return own ?? byFreshness[0] ?? null;
}

export function buildNewContactTarget(input: {
    /** Сделка контекста (открыто из сделки); null — не из сделки. */
    deal: ContactDealRow | null;
    /** Компания контекста — у сделки это её собственная компания. */
    companyId: unknown;
    /** Открытая «ОП Основная» компании (открыто из компании). */
    baseDeal: ContactDealRow | null;
    leadResponsibleId: unknown;
    /** За кого идёт работа: сотрудник в режиме руководителя или сам. */
    workOwnerId: unknown;
}): NewContactTarget {
    const deal = input.deal ?? input.baseDeal;
    return {
        companyId: positiveId(input.companyId),
        dealId: deal ? positiveId(deal.ID) : null,
        responsibleId:
            (deal ? positiveId(deal.ASSIGNED_BY_ID) : null) ??
            positiveId(input.leadResponsibleId) ??
            positiveId(input.workOwnerId),
    };
}
