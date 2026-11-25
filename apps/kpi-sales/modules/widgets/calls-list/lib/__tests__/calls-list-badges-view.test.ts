import { describe, expect, it } from 'vitest';
import type {
    CallsListBadgeFacet,
    CallsListFacets,
    CallsListPointFacet,
} from '@/modules/entities/calls-list';
import {
    callsListAddFilterOptions,
    callsListBadgeChips,
    callsListPointChips,
    hasCallsListBadgeBar,
} from '../calls-list-badges-view';

const badge = (patch: Partial<CallsListBadgeFacet> = {}): CallsListBadgeFacet => ({
    id: 'no_price',
    title: 'Без цены',
    hint: 'Менеджер не назвал цену.',
    tone: 'bad',
    family: null,
    main: true,
    since: null,
    count: 1234,
    ...patch,
});

const point = (patch: Partial<CallsListPointFacet> = {}): CallsListPointFacet => ({
    code: 'greeting',
    label: 'Приветствие',
    title: 'Поздоровался и представился',
    callTypes: ['cold'],
    main: true,
    done: 40,
    missed: 12,
    ...patch,
});

const facets = (patch: Partial<CallsListFacets> = {}): CallsListFacets => ({
    managers: [],
    callTypes: [],
    ...patch,
});

describe('hasCallsListBadgeBar — есть ли что показать', () => {
    it('старый ответ без бейджей и пунктов — панели нет', () => {
        expect(hasCallsListBadgeBar(null)).toBe(false);
        expect(hasCallsListBadgeBar(undefined)).toBe(false);
        expect(hasCallsListBadgeBar(facets())).toBe(false);
        expect(hasCallsListBadgeBar(facets({ badges: [], points: [] }))).toBe(false);
    });

    it('есть общие бейджи или пункты методики — панель есть', () => {
        expect(hasCallsListBadgeBar(facets({ badges: [badge()] }))).toBe(true);
        expect(hasCallsListBadgeBar(facets({ points: [point()] }))).toBe(true);
    });
});

describe('callsListBadgeChips — чипы общих бейджей', () => {
    it('подпись, число, цвет по тону бэка и выбранность', () => {
        const chips = callsListBadgeChips(
            [
                badge(),
                badge({ id: 'warm', title: 'Тёплый', tone: 'warn', count: 5 }),
                badge({ id: 'ok', title: 'Хорошо', tone: 'good' }),
                badge({ id: 'misc', title: 'Прочее', tone: 'neutral' }),
            ],
            ['warm'],
        );
        expect(chips.map(chip => [chip.id, chip.label, chip.count, chip.tone, chip.selected])).toEqual([
            ['no_price', 'Без цены', 1234, 'destructive', false],
            ['warm', 'Тёплый', 5, 'warning', true],
            ['ok', 'Хорошо', 1234, 'success', false],
            ['misc', 'Прочее', 1234, 'neutral', false],
        ]);
    });

    it('подсказка — пояснение бэка, с датой «Считается с…»', () => {
        const [plain, dated] = callsListBadgeChips(
            [badge(), badge({ id: 'new', since: '2026-10-01' })],
            [],
        );
        expect(plain?.hint).toBe('Менеджер не назвал цену.');
        expect(dated?.hint).toBe('Менеджер не назвал цену. Считается с 01.10.2026.');
    });
});

describe('callsListPointChips — чипы пунктов методики', () => {
    it('выключен: подпись и число «не исполнено», не выбран', () => {
        const [chip] = callsListPointChips([point()], []);
        expect(chip).toMatchObject({
            id: 'greeting',
            label: 'Приветствие',
            count: 12,
            selected: false,
        });
        expect(chip?.hint).toContain('Поздоровался и представился');
    });

    it('«не исполнено»: подпись с состоянием, число «не исполнено», красный', () => {
        const [chip] = callsListPointChips([point()], [{ code: 'greeting', state: 'missed' }]);
        expect(chip).toMatchObject({
            label: 'Приветствие: не исполнено',
            count: 12,
            tone: 'destructive',
            selected: true,
        });
    });

    it('«исполнено»: подпись с состоянием, число «исполнено», зелёный', () => {
        const [chip] = callsListPointChips([point()], [{ code: 'greeting', state: 'done' }]);
        expect(chip).toMatchObject({
            label: 'Приветствие: исполнено',
            count: 40,
            tone: 'success',
            selected: true,
        });
    });

    it('состояние берётся по коду своего пункта', () => {
        const chips = callsListPointChips(
            [point(), point({ code: 'price', label: 'Цена' })],
            [{ code: 'price', state: 'done' }],
        );
        expect(chips.map(chip => chip.selected)).toEqual([false, true]);
    });
});

describe('callsListAddFilterOptions — «Добавить фильтр»', () => {
    it('только не основные: бейджи, затем пункты с названием методики и приставкой в id', () => {
        const options = callsListAddFilterOptions(
            facets({
                badges: [badge(), badge({ id: 'rare', title: 'Редкий', main: false, count: 2500 })],
                points: [
                    point(),
                    point({ code: 'budget', label: 'Бюджет', main: false, missed: 9 }),
                ],
                methodology: { code: 'polyansky', title: 'Полянский' },
            }),
        );
        expect(options).toEqual([
            { value: 'rare', label: 'Редкий', hint: (2500).toLocaleString('ru-RU') },
            { value: 'm:budget', label: 'Полянский: Бюджет', hint: '9' },
        ]);
    });

    it('методики нет — пункт без приставки; ответ без бейджей — пусто', () => {
        expect(
            callsListAddFilterOptions(
                facets({ points: [point({ main: false })], methodology: null }),
            ),
        ).toEqual([{ value: 'm:greeting', label: 'Приветствие', hint: '12' }]);
        expect(callsListAddFilterOptions(facets())).toEqual([]);
    });
});
