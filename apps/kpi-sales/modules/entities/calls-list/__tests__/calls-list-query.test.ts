import { describe, expect, it } from 'vitest';
import {
    CALLS_LIST_BADGES_MAX,
    CALLS_LIST_POINTS_MAX,
    buildCallsListSearch,
    callsListOverflowPage,
    callsListRequestOf,
    defaultCallsListQuery,
    isCallsListFiltered,
    parseCallsListQuery,
    patchCallsListQuery,
    resetCallsListFilters,
    type CallsListQuery,
} from '..';

const TODAY = new Date(2026, 10, 19, 15, 30);
const REQUESTER = { domain: 'gsr.bitrix24.ru', requesterUserId: '447' };

const query = (patch: Partial<CallsListQuery> = {}): CallsListQuery => ({
    ...defaultCallsListQuery(TODAY),
    ...patch,
});

describe('calls-list-query — фильтры списка разборов в адресе страницы', () => {
    it('по умолчанию: последние 30 дней, всё, новые сверху, первая страница по 25', () => {
        expect(defaultCallsListQuery(TODAY)).toEqual({
            from: '2026-10-21',
            to: '2026-11-19',
            managerIds: [],
            callTypes: [],
            badges: [],
            points: [],
            scoreMin: null,
            scoreMax: null,
            review: 'any',
            sort: 'date_desc',
            page: 1,
            pageSize: 25,
        });
        expect(parseCallsListQuery('', TODAY)).toEqual(defaultCallsListQuery(TODAY));
    });

    it('адрес по умолчанию пустой — значения по умолчанию не пишутся', () => {
        expect(buildCallsListSearch(query(), TODAY)).toBe('');
    });

    it('все фильтры: адрес собирается и разбирается обратно без потерь', () => {
        const full = query({
            from: '2026-09-01',
            to: '2026-11-15',
            managerIds: ['447', '512'],
            callTypes: ['cold', 'presentation'],
            badges: ['no_price', 'second_call'],
            points: [
                { code: 'greeting', state: 'missed' },
                { code: 'need.budget', state: 'done' },
            ],
            scoreMin: 3,
            scoreMax: 6.5,
            review: 'disagreed',
            sort: 'score_asc',
            page: 3,
            pageSize: 50,
        });
        const search = buildCallsListSearch(full, TODAY);
        expect(search).toBe(
            '?from=2026-09-01&to=2026-11-15&managers=447%2C512&types=cold%2Cpresentation' +
                '&badges=no_price%2Csecond_call&points=greeting%3Amissed%2Cneed.budget%3Adone' +
                '&scoreMin=3&scoreMax=6.5&review=disagreed&sort=score_asc&page=3&size=50',
        );
        expect(parseCallsListQuery(search, TODAY)).toEqual(full);
        expect(parseCallsListQuery(new URLSearchParams(search), TODAY)).toEqual(full);
    });

    it('кривые значения в адресе заменяются умолчаниями', () => {
        const parsed = parseCallsListQuery(
            '?from=2026-02-30&to=вчера&managers=447,abc,,447&types=,cold' +
                '&scoreMin=0&scoreMax=11&review=all&sort=random&page=-2&size=30',
            TODAY,
        );
        expect(parsed).toEqual(
            query({ managerIds: ['447'], callTypes: ['cold'] }),
        );
        expect(parseCallsListQuery('?page=2.5&size=100', TODAY)).toMatchObject({
            page: 1,
            pageSize: 100,
        });
    });

    it('границы оценки по порядку: «от 8 до 3» становится «от 3 до 8»', () => {
        expect(parseCallsListQuery('?scoreMin=8&scoreMax=3', TODAY)).toMatchObject({
            scoreMin: 3,
            scoreMax: 8,
        });
        expect(patchCallsListQuery(query({ scoreMax: 4 }), { scoreMin: 9 })).toMatchObject({
            scoreMin: 4,
            scoreMax: 9,
        });
    });

    it('смена фильтра возвращает на первую страницу, смена страницы — нет', () => {
        const onThird = query({ page: 3 });
        expect(patchCallsListQuery(onThird, { review: 'reviewed' }).page).toBe(1);
        expect(patchCallsListQuery(onThird, { pageSize: 100 }).page).toBe(1);
        expect(patchCallsListQuery(onThird, { page: 4 }).page).toBe(4);
    });

    it('сброс фильтров сохраняет размер страницы; «фильтры заданы» не видит страницу и размер', () => {
        const busy = query({ managerIds: ['447'], sort: 'date_asc', page: 5, pageSize: 100 });
        expect(isCallsListFiltered(busy, TODAY)).toBe(true);
        const reset = resetCallsListFilters(busy, TODAY);
        expect(reset).toEqual(query({ pageSize: 100 }));
        expect(isCallsListFiltered(reset, TODAY)).toBe(false);
        expect(isCallsListFiltered(query({ page: 4, pageSize: 50 }), TODAY)).toBe(false);
    });

    it('тело запроса: пустые фильтры не отправляются', () => {
        expect(callsListRequestOf(query(), REQUESTER)).toEqual({
            ...REQUESTER,
            from: '2026-10-21',
            to: '2026-11-19',
            review: 'any',
            sort: 'date_desc',
            page: 1,
            pageSize: 25,
        });
        expect(
            callsListRequestOf(
                query({ managerIds: ['447'], callTypes: ['cold'], scoreMin: 2, scoreMax: 5 }),
                REQUESTER,
            ),
        ).toMatchObject({ managerIds: ['447'], callTypes: ['cold'], scoreMin: 2, scoreMax: 5 });
    });

    it('страница за последней: переход на последнюю, иначе ничего', () => {
        expect(callsListOverflowPage({ page: 9, pageSize: 25 }, { total: 60, itemsCount: 0 })).toBe(3);
        expect(callsListOverflowPage({ page: 2, pageSize: 25 }, { total: 60, itemsCount: 25 })).toBeNull();
        expect(callsListOverflowPage({ page: 3, pageSize: 25 }, { total: 0, itemsCount: 0 })).toBeNull();
        expect(callsListOverflowPage({ page: 1, pageSize: 25 }, { total: 10, itemsCount: 0 })).toBeNull();
    });
});

describe('calls-list-query — бейджи и пункты методики', () => {
    const many = (count: number, make: (index: number) => string): string =>
        Array.from({ length: count }, (_, index) => make(index)).join(',');

    it('по умолчанию бейджей и пунктов нет, в адрес они не попадают', () => {
        const parsed = parseCallsListQuery('', TODAY);
        expect(parsed.badges).toEqual([]);
        expect(parsed.points).toEqual([]);
        expect(buildCallsListSearch(query({ badges: [], points: [] }), TODAY)).toBe('');
    });

    it('бейджи: адрес собирается и разбирается обратно без потерь', () => {
        const withBadges = query({ badges: ['no_price', 'second_call', 'x1'] });
        const search = buildCallsListSearch(withBadges, TODAY);
        expect(search).toBe('?badges=no_price%2Csecond_call%2Cx1');
        expect(parseCallsListQuery(search, TODAY)).toEqual(withBadges);
    });

    it('бейджи: кривые id и повторы пропускаются', () => {
        const parsed = parseCallsListQuery(
            '?badges=no_price,No_Price,1abc,a-b,,a b,no_price,ok_2',
            TODAY,
        );
        expect(parsed.badges).toEqual(['no_price', 'ok_2']);
    });

    it('бейджи: больше предела отбрасываются с конца', () => {
        const parsed = parseCallsListQuery(`?badges=${many(40, index => `b${index}`)}`, TODAY);
        expect(parsed.badges).toHaveLength(CALLS_LIST_BADGES_MAX);
        expect(parsed.badges[0]).toBe('b0');
        expect(parsed.badges[CALLS_LIST_BADGES_MAX - 1]).toBe(`b${CALLS_LIST_BADGES_MAX - 1}`);
    });

    it('пункты: адрес собирается и разбирается обратно, порядок сохраняется', () => {
        const withPoints = query({
            points: [
                { code: 'need.budget', state: 'done' },
                { code: 'greeting', state: 'missed' },
                { code: 'price-offer', state: 'missed' },
                { code: 'a_b', state: 'done' },
            ],
        });
        const search = buildCallsListSearch(withPoints, TODAY);
        expect(search).toBe(
            '?points=need.budget%3Adone%2Cgreeting%3Amissed%2Cprice-offer%3Amissed%2Ca_b%3Adone',
        );
        expect(parseCallsListQuery(search, TODAY)).toEqual(withPoints);
    });

    it('пункты: на один код одно состояние — побеждает последнее', () => {
        const parsed = parseCallsListQuery(
            '?points=greeting:missed,need:done,greeting:done',
            TODAY,
        );
        expect(parsed.points).toEqual([
            { code: 'greeting', state: 'done' },
            { code: 'need', state: 'done' },
        ]);
    });

    it('пункты: кривые коды, состояния и записи пропускаются', () => {
        const parsed = parseCallsListQuery(
            '?points=greeting:wrong,:done,Bad:done,1a:done,a..b:done,a.:done,x:y:done,' +
                'nocolon,greeting:,ok.1-b:missed,,',
            TODAY,
        );
        expect(parsed.points).toEqual([{ code: 'ok.1-b', state: 'missed' }]);
    });

    it('пункты: больше предела отбрасываются с конца', () => {
        const parsed = parseCallsListQuery(
            `?points=${many(30, index => `p${index}:missed`)}`,
            TODAY,
        );
        expect(parsed.points).toHaveLength(CALLS_LIST_POINTS_MAX);
        expect(parsed.points[0]).toEqual({ code: 'p0', state: 'missed' });
    });

    it('смена бейджей или пунктов возвращает на первую страницу', () => {
        const onThird = query({ page: 3 });
        expect(patchCallsListQuery(onThird, { badges: ['no_price'] }).page).toBe(1);
        expect(
            patchCallsListQuery(onThird, { points: [{ code: 'greeting', state: 'done' }] }).page,
        ).toBe(1);
    });

    it('бейджи и пункты — это «фильтры заданы»; сброс их снимает', () => {
        const busy = query({ badges: ['no_price'], pageSize: 50 });
        expect(isCallsListFiltered(busy, TODAY)).toBe(true);
        expect(isCallsListFiltered(query({ points: [{ code: 'g', state: 'done' }] }), TODAY)).toBe(
            true,
        );
        expect(resetCallsListFilters(busy, TODAY)).toEqual(query({ pageSize: 50 }));
    });

    it('тело запроса несёт бейджи и пункты только когда они есть', () => {
        expect(callsListRequestOf(query(), REQUESTER)).not.toHaveProperty('badges');
        expect(callsListRequestOf(query(), REQUESTER)).not.toHaveProperty('points');
        expect(
            callsListRequestOf(
                query({ badges: ['no_price'], points: [{ code: 'greeting', state: 'missed' }] }),
                REQUESTER,
            ),
        ).toMatchObject({
            badges: ['no_price'],
            points: [{ code: 'greeting', state: 'missed' }],
        });
    });
});
