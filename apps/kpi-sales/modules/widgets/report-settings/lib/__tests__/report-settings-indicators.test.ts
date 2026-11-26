import { describe, expect, it } from 'vitest';
import {
    buildSaveBody,
    formFromView,
    isFormDirty,
    setTabVisible,
    type ReportSettingsCatalog,
} from '../report-settings-form';
import {
    anyPlanColumnsSwitchOn,
    isPlanColumnShown,
    labelDraft,
    labelsToSave,
    resetLabel,
    setLabel,
    setPlanColumnShown,
    setPlanColumnsSwitch,
} from '../report-settings-indicators';
import { INDICATORS, portalView } from './report-settings-indicators.fixtures';

/*
 * Раздел «Показатели»: свои названия и колонки планов в форме настроек.
 * Сохраняется только изменённое; свои названия уходят целиком (бэк
 * заменяет набор), без пробелов по краям и без пустых.
 */

const CATALOG: ReportSettingsCatalog = { badges: [], indicators: INDICATORS };
const NO_CATALOG: ReportSettingsCatalog = { badges: [], indicators: [] };

describe('свои названия в форме', () => {
    it('поле хранит набранное как есть, пробелы убираются только при сохранении', () => {
        const form = setLabel(formFromView(portalView()), 'call:30', '  Дозвоны ');
        expect(labelDraft(form, 'call:30')).toBe('  Дозвоны ');
        expect(labelDraft(form, 'call:all')).toBe('');
    });

    it('пустое поле — своего названия нет', () => {
        const start = formFromView(portalView({ labels: { 'call:30': 'Дозвоны' } }));
        expect(setLabel(start, 'call:30', '').labels).toEqual({});
    });

    it('длиннее 60 знаков — обрезается', () => {
        const form = setLabel(formFromView(portalView()), 'call:30', 'я'.repeat(70));
        expect(labelDraft(form, 'call:30')).toHaveLength(60);
    });

    it('«вернуть исходное» убирает своё название, остальные остаются', () => {
        const start = formFromView(
            portalView({ labels: { 'call:30': 'Дозвоны', 'ev:presentation_done': 'Встреча' } }),
        );
        expect(resetLabel(start, 'call:30').labels).toEqual({
            'ev:presentation_done': 'Встреча',
        });
        expect(resetLabel(start, 'call:all').labels).toEqual(start.labels);
    });

    it('исходная форма не меняется', () => {
        const start = formFromView(portalView({ labels: { 'call:30': 'Дозвоны' } }));
        setLabel(start, 'call:all', 'Все');
        resetLabel(start, 'call:30');
        expect(start.labels).toEqual({ 'call:30': 'Дозвоны' });
    });
});

describe('колонки планов в форме', () => {
    it('переключатели вкладок', () => {
        const start = formFromView(portalView());
        expect(anyPlanColumnsSwitchOn(start)).toBe(false);
        const merged = setPlanColumnsSwitch(start, 'plansMerged', true);
        expect(merged).toMatchObject({
            plansEvents: false,
            plansMerged: true,
            plansCallings: false,
        });
        expect(anyPlanColumnsSwitchOn(merged)).toBe(true);
        expect(anyPlanColumnsSwitchOn(setPlanColumnsSwitch(merged, 'plansMerged', false))).toBe(
            false,
        );
    });

    it('выключить и снова включить колонку плана', () => {
        const start = formFromView(portalView());
        expect(isPlanColumnShown(start, 'calls_over_30s')).toBe(true);
        const hidden = setPlanColumnShown(start, 'calls_over_30s', false);
        expect(hidden.planColumnsHidden).toEqual(['calls_over_30s']);
        expect(isPlanColumnShown(hidden, 'calls_over_30s')).toBe(false);
        expect(setPlanColumnShown(hidden, 'calls_over_30s', true).planColumnsHidden).toEqual([]);
    });

    it('повторное выключение не плодит дубли', () => {
        const form = setPlanColumnShown(
            setPlanColumnShown(formFromView(portalView()), 'calls_done', false),
            'calls_done',
            false,
        );
        expect(form.planColumnsHidden).toEqual(['calls_done']);
    });
});

describe('labelsToSave — свои названия к сохранению', () => {
    it('пробелы по краям убраны, пустые и пробельные — не названия', () => {
        expect(
            labelsToSave(
                { 'call:30': '  Дозвоны ', 'call:all': '', 'ev:presentation_done': '   ' },
                INDICATORS,
            ),
        ).toEqual({ 'call:30': 'Дозвоны' });
    });

    it('ключ не из каталога (показатель убран с портала) не уходит', () => {
        expect(
            labelsToSave({ 'ev:gone': 'Старое', 'plan:calls_over_30s': 'План' }, INDICATORS),
        ).toEqual({ 'plan:calls_over_30s': 'План' });
    });

    it('без каталога сохранять нечего', () => {
        expect(labelsToSave({ 'call:30': 'Дозвоны' }, [])).toEqual({});
    });
});

describe('isFormDirty и buildSaveBody — раздел «Показатели»', () => {
    it('нетронутая форма: изменений нет, тело пустое', () => {
        const current = portalView({
            labels: { 'call:30': 'Дозвоны' },
            plansEvents: true,
            planColumnsHidden: ['calls_done'],
        });
        const form = formFromView(current);
        expect(isFormDirty(current, form, CATALOG)).toBe(false);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({});
    });

    it('название сравнивается после обрезки пробелов', () => {
        const current = portalView({ labels: { 'call:30': 'Дозвоны' } });
        const form = setLabel(formFromView(current), 'call:30', '  Дозвоны  ');
        expect(isFormDirty(current, form, CATALOG)).toBe(false);
    });

    it('пробельное название равно отсутствию своего', () => {
        const current = portalView();
        const form = setLabel(formFromView(current), 'call:30', '   ');
        expect(isFormDirty(current, form, CATALOG)).toBe(false);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({});
    });

    it('изменённое название: уходит весь набор, очищенный', () => {
        const current = portalView({ labels: { 'call:30': 'Дозвоны' } });
        const form = setLabel(formFromView(current), 'ev:presentation_plan', ' Назначенная  ');
        expect(isFormDirty(current, form, CATALOG)).toBe(true);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({
            labels: { 'call:30': 'Дозвоны', 'ev:presentation_plan': 'Назначенная' },
        });
    });

    it('«вернуть исходное» последнего своего названия — пустой набор', () => {
        const current = portalView({ labels: { 'call:30': 'Дозвоны' } });
        const form = resetLabel(formFromView(current), 'call:30');
        expect(buildSaveBody(current, form, CATALOG)).toEqual({ labels: {} });
    });

    it('сохранённое название не из каталога изменением не считается и с набором не уходит', () => {
        const current = portalView({ labels: { 'ev:gone': 'Старое', 'call:30': 'Дозвоны' } });
        expect(isFormDirty(current, formFromView(current), CATALOG)).toBe(false);
        const form = setLabel(formFromView(current), 'call:all', 'Все');
        expect(buildSaveBody(current, form, CATALOG)).toEqual({
            labels: { 'call:30': 'Дозвоны', 'call:all': 'Все' },
        });
    });

    it('без каталога названия не уходят: проверить их бэку не по чему', () => {
        const current = portalView({ labels: { 'call:30': 'Дозвоны' } });
        const form = setLabel(formFromView(current), 'call:30', 'Другое');
        expect(isFormDirty(current, form, NO_CATALOG)).toBe(false);
        expect(buildSaveBody(current, form, NO_CATALOG)).toEqual({});
    });

    it('переключатель вкладки — только он', () => {
        const current = portalView({ plansEvents: true });
        const form = setPlanColumnsSwitch(
            setPlanColumnsSwitch(formFromView(current), 'plansCallings', true),
            'plansEvents',
            false,
        );
        expect(buildSaveBody(current, form, CATALOG)).toEqual({
            plansEvents: false,
            plansCallings: true,
        });
    });

    it('переключатель вернули как было — изменений нет', () => {
        const current = portalView();
        const form = setPlanColumnsSwitch(
            setPlanColumnsSwitch(formFromView(current), 'plansMerged', true),
            'plansMerged',
            false,
        );
        expect(isFormDirty(current, form, CATALOG)).toBe(false);
    });

    it('скрытые колонки планов: сравнение без учёта порядка', () => {
        const current = portalView({ planColumnsHidden: ['calls_done', 'offers_sent'] });
        const reordered = { ...formFromView(current), planColumnsHidden: ['offers_sent', 'calls_done'] };
        expect(isFormDirty(current, reordered, CATALOG)).toBe(false);
        const shown = setPlanColumnShown(reordered, 'calls_done', true);
        expect(buildSaveBody(current, shown, CATALOG)).toEqual({
            planColumnsHidden: ['offers_sent'],
        });
    });

    it('всё сразу — вместе с вкладками отчёта', () => {
        const current = portalView();
        let form = formFromView(current);
        form = setTabVisible(form, 'finance', false);
        form = setLabel(form, 'plan:calls_over_30s', 'План');
        form = setPlanColumnsSwitch(form, 'plansMerged', true);
        form = setPlanColumnShown(form, 'presentations_done', false);
        expect(buildSaveBody(current, form, CATALOG)).toEqual({
            tabsHidden: ['finance'],
            labels: { 'plan:calls_over_30s': 'План' },
            plansMerged: true,
            planColumnsHidden: ['presentations_done'],
        });
    });

    it('тело не делит набор и список с формой', () => {
        const current = portalView();
        const form = setPlanColumnShown(
            setLabel(formFromView(current), 'call:30', 'Дозвоны'),
            'calls_done',
            false,
        );
        const body = buildSaveBody(current, form, CATALOG);
        body.planColumnsHidden?.push('x');
        if (body.labels) body.labels['call:all'] = 'x';
        expect(form.planColumnsHidden).toEqual(['calls_done']);
        expect(form.labels).toEqual({ 'call:30': 'Дозвоны' });
    });
});
