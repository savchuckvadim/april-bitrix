/**
 * Тексты и адреса сводки портала (админка → портал). Grafana — только если
 * задан публичный адрес в NEXT_PUBLIC_GRAFANA_URL (дашборд «Нагрузка на
 * Битрикс», uid april-bitrix-load, переменная domain).
 */
const GRAFANA_URL = (process.env.NEXT_PUBLIC_GRAFANA_URL ?? '').replace(/\/+$/, '');

export function grafanaLoadUrl(domain: string): string | null {
    return GRAFANA_URL
        ? `${GRAFANA_URL}/d/april-bitrix-load?var-domain=${encodeURIComponent(domain)}`
        : null;
}

export const portalUrl = (domain: string): string => `https://${domain}/`;

/** Раздел «Разработчикам» портала (локальные приложения, вебхуки). */
export const portalDevUrl = (domain: string): string =>
    `https://${domain}/devops/section/standard/`;

/** Часы окна «нагрузка и ошибки». */
export const LOAD_WINDOW_HOURS = 24;

/** Дней в статистике обращений в поддержку. */
export const SUPPORT_STATS_DAYS = 30;

export const APPROVAL_TITLE: Record<string, { label: string; tone: 'success' | 'warning' | 'destructive' | 'muted' }> = {
    approved: { label: 'допущен', tone: 'success' },
    pending: { label: 'ждёт одобрения', tone: 'warning' },
    blocked: { label: 'отключён', tone: 'destructive' },
};

export const OVERVIEW_TEXT = {
    openPortal: 'Открыть портал',
    devSection: 'Раздел «Разработчикам»',
    legacyClient: 'действующий клиент',
    noOrganization: 'организация не привязана',
    loading: 'Загрузка…',
    loadError: 'Не загрузилось',
} as const;
