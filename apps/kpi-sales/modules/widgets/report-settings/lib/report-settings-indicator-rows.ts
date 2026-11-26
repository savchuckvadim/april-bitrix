import type {
    PortalViewIndicator,
    PortalViewIndicatorGroup,
} from '@/modules/feature/portal-view';
// Прямой путь, не барель фичи: нужна одна чистая функция подписи колонки.
import { defaultPlanColumnLabel } from '@/modules/feature/plans/lib/plan-columns.util';
import {
    createIndicatorLabeler,
    normalizeIndicatorName,
    planCodeOfLabelKey,
} from '@/modules/shared/lib/indicator-labels';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import {
    isPlanColumnShown,
    labelDraft,
    type ReportSettingsIndicatorsForm,
} from './report-settings-indicators';

/** Группы своих названий — в порядке показа. */
export const LABEL_GROUPS = [
    'events',
    'callings',
] as const satisfies readonly PortalViewIndicatorGroup[];

export type LabelGroup = (typeof LABEL_GROUPS)[number];

/** Строка своего названия показателя. */
export interface LabelRowView {
    key: string;
    /** Исходное название без лишних пробелов. */
    name: string;
    /** Своё название, как набрано; не задано — пустая строка. */
    draft: string;
}

export interface LabelGroupView {
    group: LabelGroup;
    title: string;
    rows: LabelRowView[];
}

/** Строка плана, который можно вывести колонкой. */
export interface PlanColumnRowView {
    /** Ключ своего названия колонки: `plan:<код>`. */
    key: string;
    /** Код планового показателя. */
    code: string;
    /** Выводится колонкой (кода нет в скрытых). */
    shown: boolean;
    /** Название показателя-факта для показа: своё из формы, иначе исходное. */
    factName: string;
    /** Подпись колонки по умолчанию «План: <факт>» — подсказка в поле. */
    defaultLabel: string;
    /** Своё название колонки, как набрано. */
    draft: string;
    /** Показатель выключен в настройках планов (известно, только если планы загружены). */
    offInPlans: boolean;
}

/**
 * Группы «События» и «Звонки» из каталога показателей — в порядке ответа
 * бэка (как в отчёте). Пустая группа не показывается.
 */
export const labelGroupViews = (
    indicators: readonly PortalViewIndicator[],
    form: ReportSettingsIndicatorsForm,
): LabelGroupView[] =>
    LABEL_GROUPS.flatMap(group => {
        const rows = indicators
            .filter(indicator => indicator.group === group)
            .map(indicator => ({
                key: indicator.key,
                name: normalizeIndicatorName(indicator.name),
                draft: labelDraft(form, indicator.key),
            }));
        return rows.length > 0
            ? [{ group, title: REPORT_SETTINGS_TEXT.labels.groups[group], rows }]
            : [];
    });

/**
 * Планы, которые можно вывести колонкой. Название факта — своё из формы
 * (действует сразу, до сохранения), иначе исходное из каталога; связь
 * плана с фактом — по ключу факта, не по названию. Набор включённых в
 * настройках планов null — неизвестно, строки не приглушаются.
 */
export const planColumnRowViews = (
    indicators: readonly PortalViewIndicator[],
    form: ReportSettingsIndicatorsForm,
    enabledPlanCodes: ReadonlySet<string> | null,
): PlanColumnRowView[] => {
    const labelOf = createIndicatorLabeler(form.labels);
    const names = new Map(indicators.map(indicator => [indicator.key, indicator.name]));
    return indicators.flatMap(indicator => {
        const code = planCodeOfLabelKey(indicator.key);
        if (indicator.group !== 'plans' || code === null) return [];
        const { factKey } = indicator;
        const factName =
            factKey === null
                ? normalizeIndicatorName(indicator.name)
                : labelOf(factKey, names.get(factKey) ?? indicator.name);
        return [
            {
                key: indicator.key,
                code,
                shown: isPlanColumnShown(form, code),
                factName,
                defaultLabel: defaultPlanColumnLabel(factName),
                draft: labelDraft(form, indicator.key),
                offInPlans: enabledPlanCodes !== null && !enabledPlanCodes.has(code),
            },
        ];
    });
};
