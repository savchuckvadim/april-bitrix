import type { PortalViewTabOption } from '@/modules/feature/portal-view';

/**
 * Общие вкладки — их видят все сотрудники портала. Хотя бы одна из них
 * должна оставаться видимой, иначе у сотрудника без особых прав не
 * останется ни одной вкладки.
 */
export function commonReportTabs(
    tabs: readonly PortalViewTabOption[],
): PortalViewTabOption[] {
    return tabs.filter(tab => tab.common);
}

/**
 * Код вкладки, выключатель которой заблокирован: единственная видимая
 * общая вкладка. null — блокировать нечего (видимых общих вкладок больше
 * одной либо бэк их не отметил).
 */
export function lockedReportTabCode(
    tabs: readonly PortalViewTabOption[],
    hiddenTabs: readonly string[],
): string | null {
    const visible = commonReportTabs(tabs).filter(tab => !hiddenTabs.includes(tab.code));
    const only = visible[0];
    return visible.length === 1 && only !== undefined ? only.code : null;
}

/** Названия вкладок в кавычках через запятую: «Все», «События». */
export function quotedTabNames(tabs: readonly PortalViewTabOption[]): string {
    return tabs.map(tab => `«${tab.name}»`).join(', ');
}
