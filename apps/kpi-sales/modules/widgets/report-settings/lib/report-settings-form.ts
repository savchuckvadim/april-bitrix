// Только типы фичи: утилита чистая, UI и стор фичи ей не нужны.
import type {
    PortalViewBadgeOption,
    PortalViewOptions,
    PortalViewSaveBody,
    PortalViewSettings,
} from '@/modules/feature/portal-view';
import { sameSet } from './report-settings-compare';
import {
    indicatorsChanges,
    indicatorsFormFromView,
    type ReportSettingsIndicatorsForm,
} from './report-settings-indicators';

/**
 * Состояние формы настроек отчёта. Повторяет модель бэка: `badgesMain`
 * пуст — действует набор бейджей по умолчанию (`mainByDefault`), непуст —
 * выбор портала. Свои названия и колонки планов — раздел «Показатели»
 * (report-settings-indicators).
 */
export interface ReportSettingsForm extends ReportSettingsIndicatorsForm {
    /** Коды скрытых вкладок (переключатель «виден» = кода в списке нет). */
    hiddenTabs: string[];
    chartsEnabled: boolean;
    badgesMain: string[];
}

/**
 * Справочники, без которых не сравнить форму с сохранённым: бейджи (набор
 * по умолчанию) и каталог показателей (какие свои названия сохранять).
 */
export type ReportSettingsCatalog = Pick<PortalViewOptions, 'badges' | 'indicators'>;

/** Идентификаторы бейджей «виден сразу» по умолчанию. */
export const defaultMainBadgeIds = (badges: readonly PortalViewBadgeOption[]): string[] =>
    badges.filter(badge => badge.mainByDefault).map(badge => badge.id);

/** Какие бейджи видны сразу при данном списке портала (пустой — по умолчанию). */
const effectiveMainIds = (
    badgesMain: readonly string[],
    badges: readonly PortalViewBadgeOption[],
): string[] => (badgesMain.length > 0 ? [...badgesMain] : defaultMainBadgeIds(badges));

/** Форма из сохранённых настроек (копии массивов — стор не мутируется). */
export const formFromView = (view: PortalViewSettings): ReportSettingsForm => ({
    hiddenTabs: [...view.tabsHidden],
    chartsEnabled: view.chartsEnabled,
    badgesMain: [...view.badgesMain],
    ...indicatorsFormFromView(view),
});

export const isTabVisible = (form: ReportSettingsForm, code: string): boolean =>
    !form.hiddenTabs.includes(code);

export const setTabVisible = (
    form: ReportSettingsForm,
    code: string,
    visible: boolean,
): ReportSettingsForm => {
    const rest = form.hiddenTabs.filter(item => item !== code);
    return { ...form, hiddenTabs: visible ? rest : [...rest, code] };
};

export const setChartsEnabled = (
    form: ReportSettingsForm,
    chartsEnabled: boolean,
): ReportSettingsForm => ({ ...form, chartsEnabled });

/** Бейдж виден сразу: по выбору портала, а без выбора — по умолчанию. */
export const isBadgeMain = (
    form: ReportSettingsForm,
    badge: PortalViewBadgeOption,
): boolean =>
    form.badgesMain.length > 0
        ? form.badgesMain.includes(badge.id)
        : badge.mainByDefault;

/**
 * Выключить бейдж можно, пока после этого остаётся хотя бы один видимый:
 * пустой список бэк читает как «набор по умолчанию», «ни одного» он выразить
 * не может. Включить можно всегда.
 */
export const canTurnBadgeOff = (
    form: ReportSettingsForm,
    badges: readonly PortalViewBadgeOption[],
    id: string,
): boolean => {
    const target = badges.find(badge => badge.id === id);
    if (!target || !isBadgeMain(form, target)) return true;
    return badges.some(badge => badge.id !== id && isBadgeMain(form, badge));
};

/**
 * Переключить бейдж. Первое изменение «набора по умолчанию» делает выбор
 * явным: он стартует с бейджей по умолчанию. Новый бейдж встаёт в конец
 * списка, остальные сохраняют порядок. Недопустимое выключение — без изменений.
 */
export const setBadgeMain = (
    form: ReportSettingsForm,
    badges: readonly PortalViewBadgeOption[],
    id: string,
    on: boolean,
): ReportSettingsForm => {
    const current = effectiveMainIds(form.badgesMain, badges);
    if (current.includes(id) === on) return form;
    if (!on && !canTurnBadgeOff(form, badges, id)) return form;
    const rest = current.filter(item => item !== id);
    return { ...form, badgesMain: on ? [...rest, id] : rest };
};

/** «Вернуть набор по умолчанию»: пустой список бейджей. */
export const resetBadgesToDefault = (form: ReportSettingsForm): ReportSettingsForm => ({
    ...form,
    badgesMain: [],
});

const tabsChanged = (view: PortalViewSettings, form: ReportSettingsForm): boolean =>
    !sameSet(view.tabsHidden, form.hiddenTabs);

const chartsChanged = (view: PortalViewSettings, form: ReportSettingsForm): boolean =>
    view.chartsEnabled !== form.chartsEnabled;

/** Набор бейджей изменился по смыслу: «пусто» и явный набор по умолчанию — одно и то же. */
const badgesChanged = (
    view: PortalViewSettings,
    form: ReportSettingsForm,
    badges: readonly PortalViewBadgeOption[],
): boolean =>
    !sameSet(
        effectiveMainIds(view.badgesMain, badges),
        effectiveMainIds(form.badgesMain, badges),
    );

/**
 * Тело сохранения — только изменённые поля (остальные бэк не трогает, и чужая
 * недавняя правка не затирается устаревшим значением формы).
 */
export const buildSaveBody = (
    view: PortalViewSettings,
    form: ReportSettingsForm,
    catalog: ReportSettingsCatalog,
): PortalViewSaveBody => {
    const body: PortalViewSaveBody = {};
    if (tabsChanged(view, form)) body.tabsHidden = [...form.hiddenTabs];
    if (chartsChanged(view, form)) body.chartsEnabled = form.chartsEnabled;
    if (badgesChanged(view, form, catalog.badges)) body.badgesMain = [...form.badgesMain];
    return { ...body, ...indicatorsChanges(view, form, catalog.indicators) };
};

/** Есть что сохранять: форма отличается от сохранённых настроек. */
export const isFormDirty = (
    view: PortalViewSettings,
    form: ReportSettingsForm,
    catalog: ReportSettingsCatalog,
): boolean => Object.keys(buildSaveBody(view, form, catalog)).length > 0;
