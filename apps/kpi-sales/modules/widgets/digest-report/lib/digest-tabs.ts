/**
 * Подвкладки дайджеста: «Всё» — все виджеты сворачиваемыми карточками,
 * остальные — по одному виджету. Подвкладка живёт в URL (`?dt=`), чтобы
 * на неё можно было сослаться; переход на вкладку отчёта — `?tab=digest`.
 */
export const DIGEST_TABS = [
    { key: 'all', label: 'Всё' },
    { key: 'hours', label: 'По часам' },
    { key: 'employees', label: 'Сотрудники' },
    { key: 'rating', label: 'Рейтинг' },
    { key: 'plan', label: 'План дня' },
    { key: 'presentations', label: 'Презентации' },
    { key: 'sales', label: 'Продажи' },
    { key: 'feed', label: 'Лента' },
] as const;

export type DigestTabKey = (typeof DIGEST_TABS)[number]['key'];
export type DigestWidgetKey = Exclude<DigestTabKey, 'all'>;

/** Параметр URL подвкладки дайджеста. */
export const DIGEST_TAB_PARAM = 'dt';

const TAB_KEYS = new Set<string>(DIGEST_TABS.map(tab => tab.key));

export const parseDigestTab = (value: string | null | undefined): DigestTabKey =>
    value && TAB_KEYS.has(value) ? (value as DigestTabKey) : 'all';

/** Ключ состояния карточки (свёрнута/раскрыта) в настройках UI. */
export const digestBlockId = (widget: DigestWidgetKey): string => `digest-${widget}`;

/** Поисковая строка с новой подвкладкой (остальные параметры сохраняются). */
export const withDigestTab = (search: string, tab: DigestTabKey): string => {
    const params = new URLSearchParams(search);
    if (tab === 'all') params.delete(DIGEST_TAB_PARAM);
    else params.set(DIGEST_TAB_PARAM, tab);
    const query = params.toString();
    return query ? `?${query}` : '';
};
