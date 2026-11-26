import { describe, expect, it } from 'vitest';
import type {
    PortalViewBadgeOption,
    PortalViewSettings,
} from '@/modules/feature/portal-view';
import {
    buildSaveBody,
    canTurnBadgeOff,
    defaultMainBadgeIds,
    formFromView,
    isBadgeMain,
    isFormDirty,
    isTabVisible,
    resetBadgesToDefault,
    setBadgeMain,
    setChartsEnabled,
    setTabVisible,
    type ReportSettingsCatalog,
} from '../report-settings-form';

const badge = (id: string, mainByDefault: boolean): PortalViewBadgeOption => ({
    id,
    title: id,
    hint: null,
    group: 'general',
    callTypes: [],
    mainByDefault,
});

/** a, b — по умолчанию видны сразу; c, d — нет. */
const BADGES = [badge('a', true), badge('b', true), badge('c', false), badge('d', false)];

/** Справочники формы: бейджи; каталог показателей — в тестах раздела «Показатели». */
const CATALOG: ReportSettingsCatalog = { badges: BADGES, indicators: [] };

const view = (patch: Partial<PortalViewSettings> = {}): PortalViewSettings => ({
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

const mainIds = (form: ReturnType<typeof formFromView>) =>
    BADGES.filter(item => isBadgeMain(form, item)).map(item => item.id);

describe('formFromView — начальное состояние формы', () => {
    it('копирует настройки портала', () => {
        const source = view({
            tabsHidden: ['ai'],
            chartsEnabled: false,
            badgesMain: ['c'],
            labels: { 'ev:presentation_plan': 'Назначенная презентация' },
            plansEvents: true,
            plansCallings: true,
            planColumnsHidden: ['calls_done'],
        });
        const form = formFromView(source);
        expect(form).toEqual({
            hiddenTabs: ['ai'],
            chartsEnabled: false,
            badgesMain: ['c'],
            labels: { 'ev:presentation_plan': 'Назначенная презентация' },
            plansEvents: true,
            plansMerged: false,
            plansCallings: true,
            planColumnsHidden: ['calls_done'],
        });
        form.hiddenTabs.push('x');
        form.labels['call:30'] = 'Дозвоны';
        form.planColumnsHidden.push('offers_sent');
        expect(source.tabsHidden).toEqual(['ai']);
        expect(source.labels).toEqual({ 'ev:presentation_plan': 'Назначенная презентация' });
        expect(source.planColumnsHidden).toEqual(['calls_done']);
    });

    it('бейджи: пустой badgesMain — набор по умолчанию', () => {
        expect(mainIds(formFromView(view()))).toEqual(['a', 'b']);
    });

    it('бейджи: непустой badgesMain — только выбранные, умолчания не примешиваются', () => {
        expect(mainIds(formFromView(view({ badgesMain: ['c', 'd'] })))).toEqual(['c', 'd']);
        expect(mainIds(formFromView(view({ badgesMain: ['b'] })))).toEqual(['b']);
    });

    it('defaultMainBadgeIds — идентификаторы с mainByDefault', () => {
        expect(defaultMainBadgeIds(BADGES)).toEqual(['a', 'b']);
        expect(defaultMainBadgeIds([])).toEqual([]);
    });
});

describe('вкладки', () => {
    it('скрытая вкладка — переключатель выключен, остальные включены', () => {
        const form = formFromView(view({ tabsHidden: ['digest'] }));
        expect(isTabVisible(form, 'digest')).toBe(false);
        expect(isTabVisible(form, 'events')).toBe(true);
    });

    it('скрыть и снова показать', () => {
        const hidden = setTabVisible(formFromView(view()), 'finance', false);
        expect(hidden.hiddenTabs).toEqual(['finance']);
        expect(setTabVisible(hidden, 'finance', true).hiddenTabs).toEqual([]);
    });

    it('повторное скрытие не плодит дубли', () => {
        const form = setTabVisible(
            setTabVisible(formFromView(view()), 'ai', false),
            'ai',
            false,
        );
        expect(form.hiddenTabs).toEqual(['ai']);
    });

    it('исходная форма не меняется', () => {
        const form = formFromView(view());
        setTabVisible(form, 'ai', false);
        expect(form.hiddenTabs).toEqual([]);
    });
});

describe('бейджи — переключение', () => {
    it('первое изменение набора по умолчанию делает выбор явным', () => {
        const form = setBadgeMain(formFromView(view()), BADGES, 'c', true);
        expect(form.badgesMain).toEqual(['a', 'b', 'c']);
        expect(mainIds(form)).toEqual(['a', 'b', 'c']);
    });

    it('выключить бейдж из набора по умолчанию', () => {
        const form = setBadgeMain(formFromView(view()), BADGES, 'a', false);
        expect(form.badgesMain).toEqual(['b']);
        expect(mainIds(form)).toEqual(['b']);
    });

    it('новый бейдж встаёт в конец, порядок остальных сохраняется', () => {
        const start = formFromView(view({ badgesMain: ['d', 'a'] }));
        expect(setBadgeMain(start, BADGES, 'b', true).badgesMain).toEqual(['d', 'a', 'b']);
        expect(setBadgeMain(start, BADGES, 'd', false).badgesMain).toEqual(['a']);
    });

    it('включение уже включённого и выключение уже выключенного — без изменений', () => {
        const form = formFromView(view());
        expect(setBadgeMain(form, BADGES, 'a', true)).toBe(form);
        expect(setBadgeMain(form, BADGES, 'c', false)).toBe(form);
    });

    it('последний видимый бейдж выключить нельзя — пустой список бэк читает как «по умолчанию»', () => {
        const form = formFromView(view({ badgesMain: ['c'] }));
        expect(canTurnBadgeOff(form, BADGES, 'c')).toBe(false);
        expect(setBadgeMain(form, BADGES, 'c', false)).toBe(form);
    });

    it('когда видимых несколько — выключить можно', () => {
        const form = formFromView(view({ badgesMain: ['c', 'd'] }));
        expect(canTurnBadgeOff(form, BADGES, 'c')).toBe(true);
        expect(canTurnBadgeOff(formFromView(view()), BADGES, 'a')).toBe(true);
    });

    it('невидимый или неизвестный бейдж выключать не требуется — запрета нет', () => {
        const form = formFromView(view({ badgesMain: ['c'] }));
        expect(canTurnBadgeOff(form, BADGES, 'd')).toBe(true);
        expect(canTurnBadgeOff(form, BADGES, 'zzz')).toBe(true);
    });

    it('«Вернуть набор по умолчанию» — пустой badgesMain', () => {
        const form = resetBadgesToDefault(formFromView(view({ badgesMain: ['c', 'd'] })));
        expect(form.badgesMain).toEqual([]);
        expect(mainIds(form)).toEqual(['a', 'b']);
    });
});

describe('isFormDirty — есть что сохранять', () => {
    it('нетронутая форма не изменена', () => {
        const current = view({ tabsHidden: ['ai'], badgesMain: ['c'] });
        expect(isFormDirty(current, formFromView(current), CATALOG)).toBe(false);
    });

    it('вкладки: сравнение без учёта порядка', () => {
        const current = view({ tabsHidden: ['ai', 'digest'] });
        const sameSet = { ...formFromView(current), hiddenTabs: ['digest', 'ai'] };
        expect(isFormDirty(current, sameSet, CATALOG)).toBe(false);
        expect(isFormDirty(current, setTabVisible(sameSet, 'ai', true), CATALOG)).toBe(true);
    });

    it('графики', () => {
        const current = view();
        expect(isFormDirty(current, setChartsEnabled(formFromView(current), false), CATALOG)).toBe(
            true,
        );
    });

    it('бейджи: изменение набора', () => {
        const current = view();
        expect(isFormDirty(current, setBadgeMain(formFromView(current), BADGES, 'c', true), CATALOG)).toBe(
            true,
        );
    });

    it('бейджи: вернули всё как было — изменений нет', () => {
        const current = view();
        const toggled = setBadgeMain(
            setBadgeMain(formFromView(current), BADGES, 'a', false),
            BADGES,
            'a',
            true,
        );
        // Явный список [b, a] равен набору по умолчанию по смыслу.
        expect(toggled.badgesMain).toEqual(['b', 'a']);
        expect(isFormDirty(current, toggled, CATALOG)).toBe(false);
    });

    it('бейджи: сброс при выбранном портале — изменение, при наборе по умолчанию — нет', () => {
        const chosen = view({ badgesMain: ['c', 'd'] });
        expect(isFormDirty(chosen, resetBadgesToDefault(formFromView(chosen)), CATALOG)).toBe(true);
        const byDefault = view();
        expect(
            isFormDirty(byDefault, resetBadgesToDefault(formFromView(byDefault)), CATALOG),
        ).toBe(false);
    });
});

describe('buildSaveBody — тело сохранения', () => {
    it('без изменений тело пустое', () => {
        const current = view({ tabsHidden: ['ai'] });
        expect(buildSaveBody(current, formFromView(current), CATALOG)).toEqual({});
    });

    it('уходят только изменённые поля', () => {
        const current = view();
        const form = setChartsEnabled(formFromView(current), false);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({ chartsEnabled: false });
    });

    it('вкладки: список скрытых кодов', () => {
        const current = view();
        const form = setTabVisible(setTabVisible(formFromView(current), 'digest', false), 'ai', false);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({ tabsHidden: ['digest', 'ai'] });
    });

    it('вкладки: показали все — пустой список скрытых', () => {
        const current = view({ tabsHidden: ['digest'] });
        const form = setTabVisible(formFromView(current), 'digest', true);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({ tabsHidden: [] });
    });

    it('бейджи: явный набор в порядке показа', () => {
        const current = view();
        const form = setBadgeMain(formFromView(current), BADGES, 'd', true);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({ badgesMain: ['a', 'b', 'd'] });
    });

    it('бейджи: сброс на умолчание отправляет пустой список', () => {
        const current = view({ badgesMain: ['c', 'd'] });
        const form = resetBadgesToDefault(formFromView(current));
        expect(buildSaveBody(current, form, CATALOG)).toEqual({ badgesMain: [] });
    });

    it('всё сразу', () => {
        const current = view({ badgesMain: ['c'] });
        let form = formFromView(current);
        form = setTabVisible(form, 'finance', false);
        form = setChartsEnabled(form, false);
        form = setBadgeMain(form, BADGES, 'd', true);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({
            tabsHidden: ['finance'],
            chartsEnabled: false,
            badgesMain: ['c', 'd'],
        });
    });

    it('тело не делит массивы с формой', () => {
        const current = view();
        const form = setTabVisible(formFromView(current), 'ai', false);
        const body = buildSaveBody(current, form, CATALOG);
        body.tabsHidden?.push('x');
        expect(form.hiddenTabs).toEqual(['ai']);
    });
});
