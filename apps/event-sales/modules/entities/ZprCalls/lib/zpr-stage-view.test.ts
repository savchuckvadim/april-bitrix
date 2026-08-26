import { describe, expect, it } from 'vitest';
import type { ZprCall } from '../model';
import {
    buildZprCallView,
    buildZprStageDict,
    findZprLadderIndex,
    splitZprCalls,
    zprStageEntityId,
} from './zpr-stage-view';

/** Стадии ЗПР как их отдаёт crm.status.list (порядок нарочно перемешан). */
const rawRows = [
    {
        STATUS_ID: 'DT1038_10:ZPR_SUCCESS',
        NAME: 'Состоялся',
        SORT: 30,
        COLOR: '00ff00',
        SEMANTICS: 'S' as const,
    },
    {
        STATUS_ID: 'DT1038_10:ZPR_PLAN',
        NAME: 'Запланирован',
        SORT: 10,
        COLOR: '#47d1e2',
        SEMANTICS: null,
    },
    {
        STATUS_ID: 'DT1038_10:ZPR_FAIL',
        NAME: 'Отменён',
        SORT: 50,
        COLOR: null,
        SEMANTICS: 'F' as const,
    },
    {
        STATUS_ID: 'DT1038_10:ZPR_NORESULT',
        NAME: 'Не состоялся',
        SORT: 40,
        COLOR: 'ff5752',
        SEMANTICS: null,
        EXTRA: { SEMANTICS: 'apology', COLOR: '#FF5752' },
    },
    {
        STATUS_ID: 'DT1038_10:ZPR_PENDING',
        NAME: 'Ожидание',
        SORT: 20,
        COLOR: 'ffa900',
        SEMANTICS: null,
    },
];

const makeCall = (over: Partial<ZprCall>): ZprCall => ({
    id: 1,
    entityTypeId: 1038,
    categoryId: 10,
    title: 'ЗПР',
    stageId: 'DT1038_10:ZPR_PLAN',
    planDate: null,
    doneDate: null,
    isSpontaneous: false,
    planComment: null,
    reportComment: null,
    comments: [],
    ...over,
});

describe('zprStageEntityId', () => {
    it('строит ENTITY_ID словаря динамического типа', () => {
        expect(zprStageEntityId(1038, 10)).toBe('DYNAMIC_1038_STAGE_10');
    });
});

describe('buildZprStageDict', () => {
    it('сортирует по SORT, нормализует цвет, провалы режет из лестницы', () => {
        const dict = buildZprStageDict(rawRows);
        expect(dict.all.map(item => item.name)).toEqual([
            'Запланирован',
            'Ожидание',
            'Состоялся',
            'Не состоялся',
            'Отменён',
        ]);
        // apology в EXTRA — тоже провал (как у стадий сделок).
        expect(dict.all[3]?.semantics).toBe('F');
        expect(dict.ladder.map(item => item.name)).toEqual([
            'Запланирован',
            'Ожидание',
            'Состоялся',
        ]);
        expect(dict.ladder[0]?.color).toBe('#47d1e2');
        expect(dict.ladder[1]?.color).toBe('#ffa900');
    });
});

describe('buildZprCallView / findZprLadderIndex', () => {
    const dict = buildZprStageDict(rawRows);

    it('открытая стадия: имя, позиция в лестнице, не закрыт', () => {
        const view = buildZprCallView(
            makeCall({ stageId: 'DT1038_10:ZPR_PENDING' }),
            dict,
        );
        expect(view.stageName).toBe('Ожидание');
        expect(view.isClosed).toBe(false);
        expect(findZprLadderIndex(dict, view.call.stageId)).toBe(1);
    });

    it('провал: закрыт и вне лестницы — UI рисует бейдж, не полоску', () => {
        const view = buildZprCallView(
            makeCall({ stageId: 'DT1038_10:ZPR_FAIL' }),
            dict,
        );
        expect(view.isClosed).toBe(true);
        expect(view.semantics).toBe('F');
        expect(findZprLadderIndex(dict, view.call.stageId)).toBe(-1);
    });

    it('успех: закрыт, но остаётся финалом лестницы', () => {
        const view = buildZprCallView(
            makeCall({ stageId: 'DT1038_10:ZPR_SUCCESS' }),
            dict,
        );
        expect(view.isClosed).toBe(true);
        expect(findZprLadderIndex(dict, view.call.stageId)).toBe(2);
    });

    it('словаря нет — элемент считается открытым (устаканится позже)', () => {
        const view = buildZprCallView(makeCall({}), undefined);
        expect(view.stageName).toBeNull();
        expect(view.isClosed).toBe(false);
    });
});

describe('splitZprCalls', () => {
    const dict = buildZprStageDict(rawRows);
    const views = [
        buildZprCallView(
            makeCall({
                id: 1,
                stageId: 'DT1038_10:ZPR_PLAN',
                planDate: '2026-08-30T10:00:00+03:00',
            }),
            dict,
        ),
        buildZprCallView(
            makeCall({
                id: 2,
                stageId: 'DT1038_10:ZPR_PENDING',
                planDate: '2026-08-26T10:00:00+03:00',
            }),
            dict,
        ),
        buildZprCallView(
            makeCall({
                id: 3,
                stageId: 'DT1038_10:ZPR_SUCCESS',
                doneDate: '2026-08-20T10:00:00+03:00',
            }),
            dict,
        ),
        buildZprCallView(
            makeCall({
                id: 4,
                stageId: 'DT1038_10:ZPR_FAIL',
                doneDate: '2026-08-24T10:00:00+03:00',
            }),
            dict,
        ),
        buildZprCallView(
            makeCall({
                id: 5,
                stageId: 'DT1038_10:ZPR_NORESULT',
                doneDate: '2026-08-22T10:00:00+03:00',
            }),
            dict,
        ),
    ];

    it('открытые — ближайший план сверху; закрытые — свежие, под лимит', () => {
        const { open, closed, closedTotal } = splitZprCalls(views, 2);
        expect(open.map(view => view.call.id)).toEqual([2, 1]);
        expect(closed.map(view => view.call.id)).toEqual([4, 5]);
        expect(closedTotal).toBe(3);
    });
});
