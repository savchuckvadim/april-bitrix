import { describe, expect, it } from 'vitest';
import { normalizePortalViewResponse } from '../lib/portal-view-normalize';
import {
    normalizeIndicatorLabels,
    normalizeIndicators,
    publicViewLabels,
} from '../lib/portal-view-labels-normalize';
import { portalViewActions, portalViewReducer } from '../model/portal-view-slice';

describe('свои названия и колонки планов в ответе portal-view', () => {
    it('полный ответ: названия, флаги и скрытые колонки планов проходят как есть', () => {
        const view = {
            labels: { 'ev:presentation_plan': 'Назначенная презентация', 'call:30': 'Дозвоны' },
            plansEvents: true,
            plansMerged: true,
            plansCallings: false,
            planColumnsHidden: ['sales_count', 'calls_over_30s'],
        };
        expect(normalizePortalViewResponse({ view }).view).toMatchObject(view);
    });

    it('старый бэк без новых полей — своих названий нет, колонки планов выключены', () => {
        const result = normalizePortalViewResponse({
            view: { tabsHidden: ['ai'], chartsEnabled: true, badgesMain: [] },
            options: { tabs: [], badges: [], methodology: null },
        });
        expect(result.view).toMatchObject({
            labels: {},
            plansEvents: false,
            plansMerged: false,
            plansCallings: false,
            planColumnsHidden: [],
        });
        expect(result.options.indicators).toEqual([]);
    });

    it('флаги — только настоящий boolean', () => {
        const result = normalizePortalViewResponse({
            view: { plansEvents: 'true', plansMerged: 1, plansCallings: null },
        });
        expect(result.view.plansEvents).toBe(false);
        expect(result.view.plansMerged).toBe(false);
        expect(result.view.plansCallings).toBe(false);
    });

    it('мусор в списке скрытых колонок планов отбрасывается', () => {
        const result = normalizePortalViewResponse({
            view: { planColumnsHidden: ['sales_count', 5, null, '', 'calls_done'] },
        });
        expect(result.view.planColumnsHidden).toEqual(['sales_count', 'calls_done']);
    });
});

describe('normalizeIndicatorLabels', () => {
    it('только «ключ → непустая строка»', () => {
        expect(
            normalizeIndicatorLabels({
                'ev:presentation_plan': 'Назначенная презентация',
                'ev:call_done': '',
                'ev:call_plan': '   ',
                'call:30': 30,
                'call:60': null,
                'plan:x': { name: 'План' },
                'call:all': 'Наборы',
            }),
        ).toEqual({
            'ev:presentation_plan': 'Назначенная презентация',
            'call:all': 'Наборы',
        });
    });

    it.each([
        ['undefined', undefined],
        ['строка', 'ev:x'],
        ['массив', ['Назначенная презентация']],
        ['null', null],
    ])('%s → пусто', (_name, raw) => {
        expect(normalizeIndicatorLabels(raw)).toEqual({});
    });

    it('битый ключ __proto__ не меняет прототип результата', () => {
        const labels = normalizeIndicatorLabels(
            JSON.parse('{"__proto__":"x","ev:a":"A"}'),
        );
        expect(Object.getPrototypeOf(labels)).toBe(Object.prototype);
        expect(labels['ev:a']).toBe('A');
    });
});

describe('normalizeIndicators', () => {
    it('валидные элементы проходят в порядке бэка', () => {
        const raw = [
            { key: 'ev:presentation_plan', group: 'events', name: 'План Презентация', factKey: null },
            { key: 'call:30', group: 'callings', name: 'Звонки > 30 сек', factKey: null },
            {
                key: 'plan:presentations_done',
                group: 'plans',
                name: 'План: Презентация',
                factKey: 'ev:presentation_done',
            },
        ];
        expect(normalizeIndicators(raw)).toEqual(raw);
    });

    it('без ключа, названия, с неизвестной группой и мусор отбрасываются', () => {
        expect(
            normalizeIndicators([
                { group: 'events', name: 'Без ключа' },
                { key: 'ev:a', group: 'events' },
                { key: 'ev:b', group: 'other', name: 'Чужая группа' },
                'мусор',
                null,
                { key: 'ev:c', group: 'events', name: 'C', factKey: 7 },
            ]),
        ).toEqual([{ key: 'ev:c', group: 'events', name: 'C', factKey: null }]);
    });

    it('колонка плана без ключа факта отбрасывается', () => {
        expect(
            normalizeIndicators([
                { key: 'plan:x', group: 'plans', name: 'План: X', factKey: null },
                { key: 'plan:y', group: 'plans', name: 'План: Y' },
            ]),
        ).toEqual([]);
    });

    it('не массив — пусто', () => {
        expect(normalizeIndicators({ key: 'ev:a' })).toEqual([]);
    });
});

describe('публичная ссылка: свои названия', () => {
    it('publicViewLabels берёт view.labels из ответа ссылки', () => {
        expect(
            publicViewLabels({
                meta: {},
                view: { labels: { 'ev:presentation_plan': 'Назначенная', 'call:30': '' } },
            }),
        ).toEqual({ 'ev:presentation_plan': 'Назначенная' });
    });

    it.each([
        ['нет view (старый бэк)', { meta: {} }],
        ['view не объект', { view: 'x' }],
        ['не объект', null],
    ])('%s → пусто', (_name, payload) => {
        expect(publicViewLabels(payload)).toEqual({});
    });

    it('publicLabelsApplied кладёт названия в настройки вида, остальное не трогает', () => {
        const before = portalViewReducer(undefined, { type: 'init' });
        const after = portalViewReducer(
            before,
            portalViewActions.publicLabelsApplied({ 'call:30': 'Дозвоны' }),
        );
        expect(after.view.labels).toEqual({ 'call:30': 'Дозвоны' });
        expect({ ...after.view, labels: {} }).toEqual(before.view);
        expect(after.loaded).toBe(before.loaded);
        expect(after.options).toBe(before.options);
    });
});
