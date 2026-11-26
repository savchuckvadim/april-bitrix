import type {
    PortalViewIndicator,
    PortalViewIndicatorGroup,
    PortalViewSettings,
} from '@/modules/feature/portal-view';

const indicator = (
    key: string,
    group: PortalViewIndicatorGroup,
    name: string,
    factKey: string | null = null,
): PortalViewIndicator => ({ key, group, name, factKey });

/**
 * Каталог показателей портала, как его отдаёт бэк: события в порядке
 * отчёта (названия — с лишними пробелами, как приходят из списков),
 * бакеты звонков, затем колонки планов с ключом факта.
 */
export const INDICATORS: PortalViewIndicator[] = [
    indicator('ev:presentation_plan', 'events', 'План  Презентация'),
    indicator('ev:presentation_done', 'events', ' Презентация'),
    indicator('call:all', 'callings', 'Все звонки'),
    indicator('call:30', 'callings', 'Звонки > 30 сек'),
    indicator('plan:presentations_done', 'plans', 'Презентации', 'ev:presentation_done'),
    indicator('plan:calls_over_30s', 'plans', 'Звонки > 30 сек', 'call:30'),
];

/** Сохранённые настройки портала: ничего своего, колонки планов выключены. */
export const portalView = (patch: Partial<PortalViewSettings> = {}): PortalViewSettings => ({
    tabsHidden: [],
    chartsEnabled: true,
    badgesMain: [],
    labels: {},
    plansEvents: false,
    plansMerged: false,
    plansCallings: false,
    planColumnsHidden: [],
    updatedBy: null,
    updatedAt: null,
    ...patch,
});
