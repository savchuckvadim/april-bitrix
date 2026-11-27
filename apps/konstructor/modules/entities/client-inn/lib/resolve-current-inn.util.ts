export type CurrentInnSource = 'requisite' | 'company';

export interface CurrentInnInput {
    /** ИНН текущего сохранённого реквизита; нет реквизита или ИНН пуст — null. */
    requisiteInn: string | null;
    /** `op_inn` компании; пусто — null. */
    companyInn: string | null;
    /** Поле `op_inn` есть на портале. */
    hasInnField: boolean;
}

export interface CurrentInn {
    /** undefined — ИНН негде показать (поля нет и реквизит без ИНН); null — не заполнен. */
    value: string | null | undefined;
    source: CurrentInnSource | null;
}

const clean = (raw: string | null): string => (raw ?? '').trim();

/**
 * Текущий ИНН клиента для шапки и выравнивания: ИНН текущего реквизита ведёт,
 * `op_inn` компании запасной (у типа клиента без реквизитов ИНН остаётся тот,
 * что записан в компании). Единственное место, где это правило записано.
 */
export const resolveCurrentInn = (input: CurrentInnInput): CurrentInn => {
    const fromRequisite = clean(input.requisiteInn);
    if (fromRequisite) return { value: fromRequisite, source: 'requisite' };
    const fromCompany = clean(input.companyInn);
    if (fromCompany) return { value: fromCompany, source: 'company' };
    return { value: input.hasInnField ? null : undefined, source: null };
};
