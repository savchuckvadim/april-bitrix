import { describe, expect, it } from 'vitest';
import { formFromView } from '../report-settings-form';
import {
    labelGroupViews,
    planColumnRowViews,
} from '../report-settings-indicator-rows';
import { setLabel, setPlanColumnShown } from '../report-settings-indicators';
import { INDICATORS, portalView } from './report-settings-indicators.fixtures';

/*
 * Строки раздела «Показатели»: что видит руководитель. Названия — по
 * ключам каталога; своё название из формы действует сразу, до сохранения.
 */

describe('labelGroupViews — группы своих названий', () => {
    it('«События», затем «Звонки», строки — в порядке каталога, без планов', () => {
        const groups = labelGroupViews(INDICATORS, formFromView(portalView()));
        expect(groups.map(group => [group.group, group.title])).toEqual([
            ['events', 'События'],
            ['callings', 'Звонки'],
        ]);
        expect(groups.map(group => group.rows.map(row => row.key))).toEqual([
            ['ev:presentation_plan', 'ev:presentation_done'],
            ['call:all', 'call:30'],
        ]);
    });

    it('исходные названия — без лишних пробелов', () => {
        const [events] = labelGroupViews(INDICATORS, formFromView(portalView()));
        expect(events?.rows.map(row => row.name)).toEqual(['План Презентация', 'Презентация']);
    });

    it('в поле — своё название, как набрано; не задано — пусто', () => {
        const form = setLabel(formFromView(portalView()), 'call:30', ' Дозвоны');
        const callings = labelGroupViews(INDICATORS, form)[1];
        expect(callings?.rows.map(row => row.draft)).toEqual(['', ' Дозвоны']);
    });

    it('портал без событий — только «Звонки»; нет каталога — групп нет', () => {
        const onlyCalls = INDICATORS.filter(indicator => indicator.group !== 'events');
        expect(
            labelGroupViews(onlyCalls, formFromView(portalView())).map(group => group.group),
        ).toEqual(['callings']);
        expect(labelGroupViews([], formFromView(portalView()))).toEqual([]);
    });
});

describe('planColumnRowViews — планы колонкой', () => {
    it('строка на каждый план: код, факт, подпись по умолчанию', () => {
        expect(planColumnRowViews(INDICATORS, formFromView(portalView()), null)).toEqual([
            {
                key: 'plan:presentations_done',
                code: 'presentations_done',
                shown: true,
                factName: 'Презентация',
                defaultLabel: 'План: Презентация',
                draft: '',
                offInPlans: false,
            },
            {
                key: 'plan:calls_over_30s',
                code: 'calls_over_30s',
                shown: true,
                factName: 'Звонки > 30 сек',
                defaultLabel: 'План: Звонки > 30 сек',
                draft: '',
                offInPlans: false,
            },
        ]);
    });

    it('своё название факта из формы — сразу в подписи и подсказке поля', () => {
        const form = setLabel(formFromView(portalView()), 'ev:presentation_done', '  Встреча ');
        const [presentations] = planColumnRowViews(INDICATORS, form, null);
        expect(presentations).toMatchObject({
            factName: 'Встреча',
            defaultLabel: 'План: Встреча',
        });
    });

    it('пробельное название факта — исходное', () => {
        const form = setLabel(formFromView(portalView()), 'call:30', '   ');
        const calls = planColumnRowViews(INDICATORS, form, null)[1];
        expect(calls?.factName).toBe('Звонки > 30 сек');
    });

    it('своё название колонки — в поле; подсказка остаётся по умолчанию', () => {
        const form = setLabel(formFromView(portalView()), 'plan:calls_over_30s', 'План');
        const calls = planColumnRowViews(INDICATORS, form, null)[1];
        expect(calls).toMatchObject({ draft: 'План', defaultLabel: 'План: Звонки > 30 сек' });
    });

    it('выключенная колонка', () => {
        const form = setPlanColumnShown(formFromView(portalView()), 'calls_over_30s', false);
        expect(planColumnRowViews(INDICATORS, form, null).map(row => row.shown)).toEqual([
            true,
            false,
        ]);
    });

    it('выключенный в настройках планов показатель приглушается, если планы загружены', () => {
        const form = formFromView(portalView());
        expect(
            planColumnRowViews(INDICATORS, form, new Set(['calls_over_30s'])).map(
                row => row.offInPlans,
            ),
        ).toEqual([true, false]);
        expect(
            planColumnRowViews(INDICATORS, form, new Set()).map(row => row.offInPlans),
        ).toEqual([true, true]);
    });

    it('планы не загружены — без приглушения', () => {
        expect(
            planColumnRowViews(INDICATORS, formFromView(portalView()), null).some(
                row => row.offInPlans,
            ),
        ).toBe(false);
    });

    it('факта нет в каталоге — подпись по названию плана', () => {
        const indicators = INDICATORS.filter(indicator => indicator.key !== 'call:30');
        const calls = planColumnRowViews(indicators, formFromView(portalView()), null)[1];
        expect(calls?.factName).toBe('Звонки > 30 сек');
        const offers = planColumnRowViews(
            [{ key: 'plan:offers_sent', group: 'plans', name: ' КП ', factKey: 'ev:gone' }],
            formFromView(portalView()),
            null,
        );
        expect(offers[0]?.factName).toBe('КП');
    });

    it('нет каталога — строк нет', () => {
        expect(planColumnRowViews([], formFromView(portalView()), null)).toEqual([]);
    });
});
