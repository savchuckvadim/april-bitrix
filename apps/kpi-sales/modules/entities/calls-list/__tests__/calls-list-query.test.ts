import { describe, expect, it } from 'vitest';
import {
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
