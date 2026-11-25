import { describe, expect, it } from 'vitest';
import {
    CALLS_LIST_BADGES_MAX,
    CALLS_LIST_POINTS_MAX,
    callsListBadgeHint,
    callsListPointCount,
    callsListPointHint,
    callsListPointId,
    callsListPointLabel,
    callsListPointState,
    callsListRowBadges,
    callsListTypesToNarrow,
    cycleCallsListPoint,
    dropCallsListFilters,
    lockCallsListTypeFacets,
    narrowCallsListTypes,
    splitCallsListBadges,
    splitCallsListPoints,
    toggleCallsListBadge,
    type CallsListBadgeFacet,
    type CallsListItemBadge,
    type CallsListPointFacet,
    type CallsListPointFilter,
} from '..';

const badge = (id: string, main: boolean): CallsListBadgeFacet => ({
    id,
    title: id,
    hint: '',
    tone: 'neutral',
    family: null,
    main,
    since: null,
    count: 1,
});

const point = (code: string, main: boolean): CallsListPointFacet => ({
    code,
    label: code,
    title: '',
    callTypes: [],
    main,
    done: 3,
    missed: 7,
});

const rowBadge = (id: string): CallsListItemBadge => ({ id, title: `Бейдж ${id}`, tone: 'bad' });

describe('calls-list-badges — что видно в панели', () => {
    const badges = [badge('a', true), badge('b', false), badge('c', false), badge('d', true)];

    it('общие бейджи: основные видны всегда, остальные — в «Добавить фильтр»', () => {
        const split = splitCallsListBadges(badges, [], []);
        expect(split.visible.map(item => item.id)).toEqual(['a', 'd']);
        expect(split.rest.map(item => item.id)).toEqual(['b', 'c']);
    });

    it('общие бейджи: выбранные и добавленные тоже видны, порядок бэка сохраняется', () => {
        expect(splitCallsListBadges(badges, ['c'], []).visible.map(item => item.id)).toEqual([
            'a',
            'c',
            'd',
        ]);
        const split = splitCallsListBadges(badges, ['c'], ['b', 'zzz']);
        expect(split.visible.map(item => item.id)).toEqual(['a', 'b', 'c', 'd']);
        expect(split.rest).toEqual([]);
    });

    it('пункты методики: основные, выбранные и добавленные (по id «m:код»)', () => {
        const points = [point('p1', true), point('p2', false), point('p3', false)];
        expect(callsListPointId('p2')).toBe('m:p2');
        expect(splitCallsListPoints(points, [], []).visible.map(item => item.code)).toEqual(['p1']);
        expect(
            splitCallsListPoints(points, [{ code: 'p3', state: 'done' }], []).visible.map(
                item => item.code,
            ),
        ).toEqual(['p1', 'p3']);
        const split = splitCallsListPoints(points, [], ['m:p2']);
        expect(split.visible.map(item => item.code)).toEqual(['p1', 'p2']);
        expect(split.rest.map(item => item.code)).toEqual(['p3']);
        // id общего бейджа с таким же текстом пункт не включает
        expect(splitCallsListPoints(points, [], ['p2']).visible.map(item => item.code)).toEqual([
            'p1',
        ]);
    });
});

describe('calls-list-badges — выбор', () => {
    it('общий бейдж: нет — добавить в конец, есть — снять', () => {
        expect(toggleCallsListBadge(['a'], 'b')).toEqual(['a', 'b']);
        expect(toggleCallsListBadge(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
        expect(toggleCallsListBadge([], 'a')).toEqual(['a']);
    });

    it('общий бейдж: на пределе новый не добавляется, снять можно', () => {
        const full = Array.from({ length: CALLS_LIST_BADGES_MAX }, (_, index) => `b${index}`);
        expect(toggleCallsListBadge(full, 'extra')).toEqual(full);
        expect(toggleCallsListBadge(full, 'b0')).toHaveLength(CALLS_LIST_BADGES_MAX - 1);
    });

    it('пункт методики по кругу: выключен → не исполнено → исполнено → выключен', () => {
        const first = cycleCallsListPoint([], 'greeting');
        expect(first).toEqual([{ code: 'greeting', state: 'missed' }]);
        const second = cycleCallsListPoint(first, 'greeting');
        expect(second).toEqual([{ code: 'greeting', state: 'done' }]);
        expect(cycleCallsListPoint(second, 'greeting')).toEqual([]);
    });

    it('пункт методики: остальные пункты и их порядок не меняются', () => {
        const start: CallsListPointFilter[] = [
            { code: 'a', state: 'done' },
            { code: 'b', state: 'missed' },
            { code: 'c', state: 'done' },
        ];
        expect(cycleCallsListPoint(start, 'b')).toEqual([
            { code: 'a', state: 'done' },
            { code: 'b', state: 'done' },
            { code: 'c', state: 'done' },
        ]);
        expect(cycleCallsListPoint(start, 'a')).toEqual([
            { code: 'b', state: 'missed' },
            { code: 'c', state: 'done' },
        ]);
        expect(cycleCallsListPoint(start, 'd').map(item => item.code)).toEqual(['a', 'b', 'c', 'd']);
        expect(start).toHaveLength(3);
    });

    it('пункт методики: на пределе новый не добавляется', () => {
        const full: CallsListPointFilter[] = Array.from(
            { length: CALLS_LIST_POINTS_MAX },
            (_, index) => ({ code: `p${index}`, state: 'missed' }),
        );
        expect(cycleCallsListPoint(full, 'extra')).toEqual(full);
        expect(cycleCallsListPoint(full, 'p0')[0]).toEqual({ code: 'p0', state: 'done' });
    });

    it('состояние пункта: выбран — его состояние, нет — null', () => {
        const points: CallsListPointFilter[] = [{ code: 'a', state: 'done' }];
        expect(callsListPointState(points, 'a')).toBe('done');
        expect(callsListPointState(points, 'b')).toBeNull();
    });
});

describe('calls-list-badges — подписи чипов', () => {
    it('пункт: выключен — подпись, иначе с состоянием', () => {
        expect(callsListPointLabel('Приветствие', null)).toBe('Приветствие');
        expect(callsListPointLabel('Приветствие', 'missed')).toBe('Приветствие: не исполнено');
        expect(callsListPointLabel('Приветствие', 'done')).toBe('Приветствие: исполнено');
    });

    it('число на чипе пункта: «не исполнено» пока выключен или не исполнен, «исполнено» — для исполненного', () => {
        const facet = point('p', true);
        expect(callsListPointCount(facet, null)).toBe(7);
        expect(callsListPointCount(facet, 'missed')).toBe(7);
        expect(callsListPointCount(facet, 'done')).toBe(3);
    });

    it('подсказка общего бейджа: пояснение, а с датой — «Считается с ДД.ММ.ГГГГ.»', () => {
        expect(callsListBadgeHint({ hint: 'Не назвали цену.', since: null })).toBe('Не назвали цену.');
        expect(callsListBadgeHint({ hint: 'Не назвали цену.', since: '2026-09-05' })).toBe(
            'Не назвали цену. Считается с 05.09.2026.',
        );
        expect(callsListBadgeHint({ hint: '', since: '2026-09-05' })).toBe('Считается с 05.09.2026.');
    });

    it('подсказка общего бейджа: дата не по формату игнорируется', () => {
        expect(callsListBadgeHint({ hint: 'Пояснение.', since: 'вчера' })).toBe('Пояснение.');
        expect(callsListBadgeHint({ hint: 'Пояснение.', since: '2026-02-30' })).toBe('Пояснение.');
    });

    it('подсказка пункта: название и как нажимать; названия нет — только как нажимать', () => {
        expect(callsListPointHint({ title: 'Назвал цену' })).toMatch(/^Назвал цену\. Нажатия по кругу/);
        expect(callsListPointHint({ title: '' })).toMatch(/^Нажатия по кругу/);
    });
});

describe('calls-list-badges — типы звонка следуют за методикой', () => {
    it('сужение — пересечение выбора с ограничением; пусто — пустой список', () => {
        expect(narrowCallsListTypes(['cold', 'warm', 'presentation'], ['warm', 'presentation'])).toEqual([
            'warm',
            'presentation',
        ]);
        expect(narrowCallsListTypes(['cold'], ['warm'])).toEqual([]);
        expect(narrowCallsListTypes([], ['warm'])).toEqual([]);
    });

    it('что записать в фильтр: нет ограничения или выбор внутри него — править нечего', () => {
        expect(callsListTypesToNarrow(['cold'], null)).toBeNull();
        expect(callsListTypesToNarrow(['cold'], undefined)).toBeNull();
        expect(callsListTypesToNarrow([], ['warm'])).toBeNull();
        expect(callsListTypesToNarrow(['warm'], ['warm', 'cold'])).toBeNull();
    });

    it('что записать в фильтр: типы вне ограничения отбрасываются', () => {
        expect(callsListTypesToNarrow(['cold', 'warm'], ['warm'])).toEqual(['warm']);
        expect(callsListTypesToNarrow(['cold'], ['warm'])).toEqual([]);
    });

    it('варианты типов: только из ограничения; нет ограничения — все', () => {
        const facets = [
            { code: 'cold', title: 'Холодный', count: 5 },
            { code: 'warm', title: 'Тёплый', count: 3 },
        ];
        expect(lockCallsListTypeFacets(facets, ['warm'])).toEqual([facets[1]]);
        expect(lockCallsListTypeFacets(facets, ['presentation'])).toEqual([]);
        expect(lockCallsListTypeFacets(facets, null)).toEqual(facets);
        expect(lockCallsListTypeFacets(facets, undefined)).toEqual(facets);
    });
});

describe('calls-list-badges — убрали из «Добавить фильтр»', () => {
    const query = {
        badges: ['a', 'b'],
        points: [
            { code: 'p1', state: 'missed' as const },
            { code: 'p2', state: 'done' as const },
        ],
    };

    it('сбрасывается фильтр убранного общего бейджа и пункта', () => {
        expect(dropCallsListFilters(query, ['b', 'm:p1'])).toEqual({
            badges: ['a'],
            points: [{ code: 'p2', state: 'done' }],
        });
    });

    it('убранного не было в фильтре — менять нечего', () => {
        expect(dropCallsListFilters(query, ['zzz', 'm:p9'])).toBeNull();
        expect(dropCallsListFilters(query, [])).toBeNull();
    });

    it('код пункта без приставки общий бейдж не затрагивает', () => {
        expect(dropCallsListFilters(query, ['p1'])).toBeNull();
    });
});

describe('calls-list-badges — бейджи строки таблицы', () => {
    it('нет бейджей или поле не пришло — пусто', () => {
        const empty = { shown: [], hiddenCount: 0, hiddenTitle: '' };
        expect(callsListRowBadges(undefined)).toEqual(empty);
        expect(callsListRowBadges([])).toEqual(empty);
    });

    it('до четырёх бейджей показываются все', () => {
        const badges = ['a', 'b', 'c', 'd'].map(rowBadge);
        const view = callsListRowBadges(badges);
        expect(view.shown).toEqual(badges);
        expect(view.hiddenCount).toBe(0);
        expect(view.hiddenTitle).toBe('');
    });

    it('больше четырёх: первые четыре, число скрытых и их названия для подсказки', () => {
        const badges = ['a', 'b', 'c', 'd', 'e', 'f'].map(rowBadge);
        const view = callsListRowBadges(badges);
        expect(view.shown.map(item => item.id)).toEqual(['a', 'b', 'c', 'd']);
        expect(view.hiddenCount).toBe(2);
        expect(view.hiddenTitle).toBe('Бейдж e, Бейдж f');
    });

    it('своё ограничение', () => {
        const view = callsListRowBadges(['a', 'b', 'c'].map(rowBadge), 1);
        expect(view.shown).toHaveLength(1);
        expect(view.hiddenCount).toBe(2);
    });
});
