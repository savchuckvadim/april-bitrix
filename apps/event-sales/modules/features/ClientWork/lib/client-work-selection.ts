import type {
    ClientWork,
    ClientWorkDeal,
    ClientWorkJoinOperationResult,
    ClientWorkJoinSummary,
} from '../model';

/**
 * ВЫБОР РУКОВОДИТЕЛЯ в блоке «Открытые сделки по клиенту» — чистые функции (тесты рядом).
 *
 * Основная по умолчанию — предложенная сервером (как в отчёте по дублям).
 * Отмечены к присоединению все остальные, если сервер не просит сначала
 * разобраться (два менеджера, разные ИНН) — тогда ничего не отмечено:
 * присоединение необратимо смешивает историю, решение за человеком.
 */

export interface ClientWorkSelection {
    readonly mainDealId: number | null;
    readonly selectedIds: number[];
}

export const initialSelection = (work: ClientWork): ClientWorkSelection => {
    const mainDealId =
        work.suggestedMainDealId ?? work.deals[0]?.id ?? null;
    const selectedIds =
        work.canJoin && work.notes.length === 0
            ? work.deals
                  .map(deal => deal.id)
                  .filter(id => id !== mainDealId)
            : [];
    return { mainDealId, selectedIds };
};

/** Новая основная: из отмеченных она уходит, прежняя — не отмечается сама. */
export const chooseMain = (
    current: ClientWorkSelection,
    dealId: number,
): ClientWorkSelection => ({
    mainDealId: dealId,
    selectedIds: current.selectedIds.filter(id => id !== dealId),
});

/** Отметить/снять сделку; основную отметить нельзя. */
export const toggleSelected = (
    selectedIds: readonly number[],
    dealId: number,
    mainDealId: number | null,
): number[] => {
    if (dealId === mainDealId) return [...selectedIds];
    return selectedIds.includes(dealId)
        ? selectedIds.filter(id => id !== dealId)
        : [...selectedIds, dealId];
};

/** Можно ли жать «Присоединить»: руководитель, основная выбрана, есть что. */
export const canSubmitJoin = (
    work: ClientWork | null,
    selection: ClientWorkSelection,
): boolean =>
    !!work?.canJoin &&
    selection.mainDealId !== null &&
    selection.selectedIds.length > 0;

const dealsWord = (count: number): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'сделку';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return 'сделки';
    }
    return 'сделок';
};

/** «#26981 «ООО Ромашка» (Иван Петров)». */
export const dealLabel = (deal: ClientWorkDeal): string =>
    `№${deal.id}${deal.title ? ` «${deal.title}»` : ''} (${deal.responsibleName})`;

/** Текст подтверждения: что произойдёт, по-русски и без кодов. */
export const confirmJoinText = (
    work: ClientWork,
    selection: ClientWorkSelection,
): string => {
    const main = work.deals.find(deal => deal.id === selection.mainDealId);
    const count = selection.selectedIds.length;
    return (
        `Присоединить ${count} ${dealsWord(count)} к ${main ? dealLabel(main) : `№${selection.mainDealId}`}? ` +
        'Они закроются стадией «Дубль», задачи, дела, контакты и заявки ' +
        'перейдут в основную и её ответственному. Ничего не удаляется, но ' +
        'вернуть сделки в работу можно будет только вручную.'
    );
};

/** Результат операции присоединения → итог для человека. */
export const summarizeJoin = (
    mainDealId: number,
    result: ClientWorkJoinOperationResult | null,
): ClientWorkJoinSummary => {
    const items = result?.items ?? [];
    const done = items.filter(item => !item.skipped);
    return {
        mainDealId,
        joined: done.length,
        skippedIds: items
            .filter(item => item.skipped)
            .map(item => item.dealId),
        tasksMoved: done.reduce((sum, item) => sum + item.tasksMoved, 0),
        activitiesMoved: done.reduce(
            (sum, item) => sum + item.activitiesMoved,
            0,
        ),
        warnings: items.flatMap(item => item.warnings),
    };
};

/** Ссылка на карточку сделки на портале. */
export const dealUrl = (domain: string, dealId: number): string =>
    `https://${domain}/crm/deal/details/${dealId}/`;
