// Только типы фичи и прямой путь к константе: утилита чистая, барель фичи
// (хуки, стор, UI) ей не нужен.
import type {
    PortalViewIndicator,
    PortalViewSaveBody,
    PortalViewSettings,
} from '@/modules/feature/portal-view';
import { PORTAL_VIEW_LABEL_MAX_LENGTH } from '@/modules/feature/portal-view/consts/portal-view.consts';
import { sameRecord, sameSet } from './report-settings-compare';

/**
 * Часть формы раздела «Показатели»: свои названия показателей и колонки
 * планов. Повторяет модель бэка: `labels` — свои названия по ключу
 * показателя (`ev:`/`call:`/`plan:`), флаги — колонки планов на вкладках,
 * `planColumnsHidden` — коды плановых показателей без колонки.
 */
export interface ReportSettingsIndicatorsForm {
    /** Свои названия, как набраны в полях; пустое поле — ключа нет. */
    labels: Record<string, string>;
    plansEvents: boolean;
    plansMerged: boolean;
    plansCallings: boolean;
    /** Коды плановых показателей, чью колонку не выводить. */
    planColumnsHidden: string[];
}

/** Переключатели колонок планов — в порядке показа на странице. */
export const PLAN_COLUMNS_SWITCHES = [
    'plansEvents',
    'plansMerged',
    'plansCallings',
] as const satisfies readonly (keyof ReportSettingsIndicatorsForm)[];

export type PlanColumnsSwitch = (typeof PLAN_COLUMNS_SWITCHES)[number];

/** Часть формы из сохранённых настроек (копии — стор не мутируется). */
export const indicatorsFormFromView = (
    view: PortalViewSettings,
): ReportSettingsIndicatorsForm => ({
    labels: { ...view.labels },
    plansEvents: view.plansEvents,
    plansMerged: view.plansMerged,
    plansCallings: view.plansCallings,
    planColumnsHidden: [...view.planColumnsHidden],
});

const withoutKey = (
    labels: Readonly<Record<string, string>>,
    key: string,
): Record<string, string> =>
    Object.fromEntries(Object.entries(labels).filter(([item]) => item !== key));

/** Текст поля своего названия: как набрано; не задано — пустая строка. */
export const labelDraft = (form: ReportSettingsIndicatorsForm, key: string): string =>
    form.labels[key] ?? '';

/**
 * Набрать своё название: значение хранится как набрано (пробелы
 * убираются при сохранении), длиннее предела — обрезается, пустое
 * поле — своего названия нет.
 */
export const setLabel = <F extends ReportSettingsIndicatorsForm>(
    form: F,
    key: string,
    value: string,
): F => {
    const draft = value.slice(0, PORTAL_VIEW_LABEL_MAX_LENGTH);
    const labels =
        draft === '' ? withoutKey(form.labels, key) : { ...form.labels, [key]: draft };
    return { ...form, labels };
};

/** «Вернуть исходное»: своё название показателя убрано. */
export const resetLabel = <F extends ReportSettingsIndicatorsForm>(form: F, key: string): F => ({
    ...form,
    labels: withoutKey(form.labels, key),
});

export const setPlanColumnsSwitch = <F extends ReportSettingsIndicatorsForm>(
    form: F,
    flag: PlanColumnsSwitch,
    on: boolean,
): F => ({ ...form, [flag]: on });

/** Колонки планов включены хотя бы на одной вкладке. */
export const anyPlanColumnsSwitchOn = (form: ReportSettingsIndicatorsForm): boolean =>
    PLAN_COLUMNS_SWITCHES.some(flag => form[flag]);

/** Плановый показатель выводится колонкой (его кода нет в скрытых). */
export const isPlanColumnShown = (form: ReportSettingsIndicatorsForm, code: string): boolean =>
    !form.planColumnsHidden.includes(code);

export const setPlanColumnShown = <F extends ReportSettingsIndicatorsForm>(
    form: F,
    code: string,
    shown: boolean,
): F => {
    const rest = form.planColumnsHidden.filter(item => item !== code);
    return { ...form, planColumnsHidden: shown ? rest : [...rest, code] };
};

/**
 * Свои названия к сохранению: пробелы по краям убраны, пустые и
 * пробельные — не названия. Только ключи каталога показателей портала:
 * чужой ключ (показатель убран с портала) бэк отклонил бы целиком, а в
 * форме его не видно и не исправить. Нет каталога — нечего сохранять.
 */
export const labelsToSave = (
    labels: Readonly<Record<string, string>>,
    indicators: readonly PortalViewIndicator[],
): Record<string, string> => {
    const known = new Set(indicators.map(indicator => indicator.key));
    return Object.fromEntries(
        Object.entries(labels).flatMap(([key, value]) => {
            const name = value.trim();
            return name !== '' && known.has(key) ? [[key, name] as const] : [];
        }),
    );
};

/**
 * Изменения раздела «Показатели» для тела сохранения — только то, что
 * отличается от сохранённого. Названия сравниваются после чистки
 * (labelsToSave) и уходят целиком: бэк заменяет набор.
 */
export const indicatorsChanges = (
    view: PortalViewSettings,
    form: ReportSettingsIndicatorsForm,
    indicators: readonly PortalViewIndicator[],
): PortalViewSaveBody => {
    const body: PortalViewSaveBody = {};
    const labels = labelsToSave(form.labels, indicators);
    if (!sameRecord(labelsToSave(view.labels, indicators), labels)) body.labels = labels;
    PLAN_COLUMNS_SWITCHES.forEach(flag => {
        if (view[flag] !== form[flag]) body[flag] = form[flag];
    });
    if (!sameSet(view.planColumnsHidden, form.planColumnsHidden)) {
        body.planColumnsHidden = [...form.planColumnsHidden];
    }
    return body;
};
