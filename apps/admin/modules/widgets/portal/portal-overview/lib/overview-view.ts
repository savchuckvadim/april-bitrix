/**
 * Чистая логика сводки портала: из ответов существующих ручек — строки и
 * итоги для карточек. Без React, покрывается тестами.
 */

/** Компонент установки (marketplace_install_components) — нужные поля. */
export interface OverviewComponent {
    componentType: string;
    componentCode: string;
    status: string;
    errorDetail?: string;
}

export type WidgetState = 'installed' | 'error' | 'missing';

export interface WidgetRow {
    code: string;
    title: string;
    state: WidgetState;
    /** Куда привязан (`CRM_DEAL_DETAIL_TAB`, …) — по данным синхронизации. */
    places: string[];
    detail: string | null;
}

const PLACEMENT_TYPE = 'placement';

/** `CRM_DEAL_DETAIL_TAB:event-sales` → место и код виджета. */
function parsePlacementCode(code: string): { place: string; widget: string } {
    const index = code.lastIndexOf(':');
    return index < 0
        ? { place: '', widget: code }
        : { place: code.slice(0, index), widget: code.slice(index + 1) };
}

/**
 * Желаемые виджеты портала (`app_widgets`) против последней синхронизации
 * привязок: установлен / ошибка / не привязан.
 */
export function widgetRows(
    desired: readonly string[],
    components: readonly OverviewComponent[],
    titles: Readonly<Record<string, string>>,
): WidgetRow[] {
    const placements = components.filter(item => item.componentType === PLACEMENT_TYPE);
    return desired.map(code => {
        const own = placements.filter(item => parsePlacementCode(item.componentCode).widget === code);
        const installed = own.filter(item => item.status === 'installed');
        const failed = own.find(item => item.status === 'error');
        return {
            code,
            title: titles[code] ?? code,
            state: failed ? 'error' : installed.length ? 'installed' : 'missing',
            places: installed.map(item => parsePlacementCode(item.componentCode).place),
            detail: failed?.errorDetail ?? null,
        };
    });
}

/** Сколько виджетов привязано по последней синхронизации (все наши привязки). */
export function installedPlacementCount(components: readonly OverviewComponent[]): number {
    return components.filter(
        item => item.componentType === PLACEMENT_TYPE && item.status === 'installed',
    ).length;
}

export interface StateCounts {
    done: number;
    todo: number;
    running: number;
    unknown: number;
}

/** Блоки запуска AI (настройки, смарт, конвейер, прогноз, переразбор, стоимость). */
export function launchCounts(
    blocks: ReadonlyArray<{ state: string } | null | undefined>,
): StateCounts {
    const counts: StateCounts = { done: 0, todo: 0, running: 0, unknown: 0 };
    for (const block of blocks) {
        const state = block?.state;
        if (state === 'done' || state === 'todo' || state === 'running') counts[state] += 1;
        else counts.unknown += 1;
    }
    return counts;
}

export interface HookCounts {
    ready: number;
    partial: number;
    notInstalled: number;
    disabled: number;
}

/** Готовность хуков: «без требований» (none) не считаем. */
export function hookCounts(
    hooks: ReadonlyArray<{ status: string; enabled: boolean | null }>,
): HookCounts {
    const counts: HookCounts = { ready: 0, partial: 0, notInstalled: 0, disabled: 0 };
    for (const hook of hooks) {
        if (hook.enabled === false) counts.disabled += 1;
        if (hook.status === 'ready') counts.ready += 1;
        else if (hook.status === 'partial') counts.partial += 1;
        else if (hook.status === 'not-installed') counts.notInstalled += 1;
    }
    return counts;
}

/** Домен без протокола, слэшей и регистра — для сравнения. */
export function normalizeDomain(value: string | null | undefined): string {
    return (value ?? '')
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '');
}

/** Открытые обращения линии поддержки именно от этого портала. */
export function dialogsOfPortal<T extends { clientPortal: string | null }>(
    dialogs: readonly T[],
    domain: string,
): T[] {
    const target = normalizeDomain(domain);
    return dialogs.filter(dialog => normalizeDomain(dialog.clientPortal) === target);
}

/** Ошибки Битрикса о перегрузке — признак, что портал упирается в лимиты. */
const BITRIX_LIMIT_RE = /QUERY_LIMIT_EXCEEDED|OPERATION_TIME_LIMIT|OVERLOAD_LIMIT|Too many requests/i;

export function isBitrixLimitError(sample: string): boolean {
    return BITRIX_LIMIT_RE.test(sample);
}

/** «2 ч 5 мин» / «12 мин». */
export function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) return `${rest} мин`;
    return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
}
