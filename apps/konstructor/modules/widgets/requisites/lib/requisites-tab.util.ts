/** Вкладки экрана реквизитов. */
export const REQUISITES_TABS = ['base', 'addresses', 'bank'] as const;

export type RequisitesTab = (typeof REQUISITES_TABS)[number];

export const isRequisitesTab = (value: string): value is RequisitesTab =>
    (REQUISITES_TABS as readonly string[]).includes(value);

/**
 * Какая вкладка на экране. Адреса и банк есть только у сохранённого
 * реквизита: у шаблона (у типа клиента ещё нет реквизитов) остаётся основная
 * вкладка, даже если менеджер ушёл на «Банковские» и сменил тип клиента.
 */
export const resolveRequisitesTab = (
    requested: RequisitesTab,
    detailsEnabled: boolean,
): RequisitesTab => (detailsEnabled ? requested : 'base');
