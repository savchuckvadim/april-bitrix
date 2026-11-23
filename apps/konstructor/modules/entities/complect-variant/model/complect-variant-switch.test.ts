import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RootState, AppThunk } from '@/modules/app/model/store';
import type { SnapshotV2 } from '../../snapshot/model/types';
import type { ComplectVariantItem } from '../lib/api/complect-variant-helper';
import {
    complectVariantActions,
    complectVariantReducer,
} from './ComplectVariantSlice';
import {
    closeComplectVariant,
    createComplectVariant,
    openComplectVariant,
    syncOpenComplectVariant,
} from './ComplectVariantThunk';
import {
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectComposition,
    type ComplectVariantRecordDto,
} from './dto';

/**
 * Правило: пока вариант открыт, живое состояние — это он, а слепок сделки
 * повторяет открытый вариант на момент открытия и каждого сохранения.
 * Сеть и слепок сделки подменены: проверяется порядок вызовов и итог в сторе.
 */
const mocks = vi.hoisted(() => ({
    saveRecord:
        vi.fn<
            (
                snapshot: SnapshotV2,
                variantSmartId: number,
            ) => Promise<ComplectVariantRecordDto>
        >(),
    createItem:
        vi.fn<
            (
                entityTypeId: number,
                dealId: number,
                title: string,
            ) => Promise<ComplectVariantItem | null>
        >(),
    listRecords:
        vi.fn<
            (domain: string, dealId: number) => Promise<ComplectVariantRecordDto[]>
        >(),
    listItems:
        vi.fn<
            (entityTypeId: number, dealId: number) => Promise<ComplectVariantItem[]>
        >(),
    getComposition:
        vi.fn<
            (domain: string, dealId: number) => Promise<ComplectComposition | null>
        >(),
    saveComposition:
        vi.fn<
            (
                domain: string,
                dealId: number,
                settings: ComplectComposition | null,
            ) => Promise<void>
        >(),
    buildCurrentSnapshotV2: vi.fn<(state: RootState) => SnapshotV2 | null>(),
    restoreSnapshotRecord:
        vi.fn<(record: ComplectVariantRecordDto) => AppThunk<Promise<void>>>(),
    saveSnapshot: vi.fn<() => AppThunk<Promise<boolean>>>(),
}));

vi.mock('../lib/api/complect-variant-helper', () => ({
    ComplectVariantHelper: class {
        saveRecord = mocks.saveRecord;
        createItem = mocks.createItem;
        listRecords = mocks.listRecords;
        listItems = mocks.listItems;
        getComposition = mocks.getComposition;
        saveComposition = mocks.saveComposition;
    },
}));
vi.mock('../../snapshot', () => ({
    buildCurrentSnapshotV2: mocks.buildCurrentSnapshotV2,
    restoreSnapshotRecord: mocks.restoreSnapshotRecord,
    saveSnapshot: mocks.saveSnapshot,
}));
vi.mock('../../portal', () => ({
    getComplectVariantPbxSmartEntityId: () => 5,
}));

const DOMAIN = 'portal.bitrix24.ru';
const DEAL_ID = 7;
const VARIANT_A = 11;
const VARIANT_B = 22;

const makeRecord = (
    variantSmartId: number,
    rows: string,
): ComplectVariantRecordDto => ({
    id: variantSmartId * 10,
    dealId: DEAL_ID,
    userId: null,
    domain: DOMAIN,
    serviceSmartId: null,
    variantSmartId,
    templateId: null,
    favoriteId: null,
    isFavorite: null,
    dealName: null,
    app: null,
    global: null,
    currentComplect: null,
    od: null,
    result: null,
    contract: null,
    product: null,
    rows,
    regions: null,
    iskraConfig: null,
    ltOther: null,
    settings: null,
});

const makeSnapshot = (savedAt: string): SnapshotV2 => ({
    schemaVersion: 2,
    dealId: DEAL_ID,
    domain: DOMAIN,
    userId: 1,
    serviceSmartId: null,
    regionCode: null,
    contractCode: null,
    supplyCode: null,
    general: { id: 'general', kind: 'general', rows: [], collapsed: false },
    alternative: [],
    templateId: null,
    savedAt,
});

const app: Pick<RootState['app'], 'dealId' | 'domain'> = {
    dealId: DEAL_ID,
    domain: DOMAIN,
};
const portal: Pick<RootState['portal'], 'current'> = { current: null };

/**
 * Стор с настоящим слайсом вариантов. Остальным слайсам хватает того, что
 * читают thunks: домен, сделка и портал. Единственное сужение типа — здесь.
 */
const makeStore = () => {
    const initial = {
        app,
        portal,
        complectVariant: complectVariantReducer(undefined, { type: '@@init' }),
    } as RootState;
    return configureStore({
        reducer: (state: RootState = initial, action: UnknownAction): RootState => ({
            ...state,
            complectVariant: complectVariantReducer(state.complectVariant, action),
        }),
    });
};

/** Стор с загруженными вариантами А и Б; открыт А. */
const makeOpenedStore = (
    records: ComplectVariantRecordDto[],
    openVariantSmartId: number | null = VARIANT_A,
) => {
    const store = makeStore();
    store.dispatch(complectVariantActions.loaded({ records, composition: null }));
    store.dispatch(complectVariantActions.setOpenVariant(openVariantSmartId));
    return store;
};

/** Порядковый номер первого вызова мока: по нему сверяется очерёдность вызовов. */
const callOrder = (mock: { mock: { invocationCallOrder: number[] } }): number => {
    const [first] = mock.mock.invocationCallOrder;
    if (first === undefined) throw new Error('мок не вызывался');
    return first;
};

const recordA = makeRecord(VARIANT_A, 'А: на входе');
const recordB = makeRecord(VARIANT_B, 'Б: на входе');
const LIVE = makeSnapshot('живое состояние');

describe('варианты: правки не пропадают при переключении и закрытии', () => {
    beforeEach(() => {
        for (const mock of Object.values(mocks)) mock.mockReset();
        mocks.buildCurrentSnapshotV2.mockReturnValue(LIVE);
        // сервер отвечает записью, в которой видно, из какого состояния она сохранена
        mocks.saveRecord.mockImplementation(async (snapshot, variantSmartId) =>
            makeRecord(variantSmartId, `сохранено: ${snapshot.savedAt}`),
        );
        mocks.saveComposition.mockResolvedValue(undefined);
        mocks.restoreSnapshotRecord.mockImplementation(() => async () => undefined);
        mocks.saveSnapshot.mockImplementation(() => async () => true);
    });

    describe('открытие', () => {
        it('открыт А, открываем Б: сначала живое состояние пишется в А, затем раскладывается Б', async () => {
            const store = makeOpenedStore([recordA, recordB]);

            const opened = await store.dispatch(openComplectVariant(recordB));

            expect(opened).toBe(true);
            expect(mocks.saveRecord).toHaveBeenCalledTimes(1);
            expect(mocks.saveRecord).toHaveBeenCalledWith(LIVE, VARIANT_A);
            expect(mocks.restoreSnapshotRecord).toHaveBeenCalledTimes(1);
            expect(mocks.restoreSnapshotRecord).toHaveBeenCalledWith(recordB);
            expect(callOrder(mocks.saveRecord)).toBeLessThan(
                callOrder(mocks.restoreSnapshotRecord),
            );
            expect(store.getState().complectVariant.openVariantSmartId).toBe(VARIANT_B);
            expect(store.getState().complectVariant.isBusy).toBe(false);
        });

        it('сохранение уходящего варианта упало: Б не открыт, указатель прежний, в слайсе ошибка', async () => {
            mocks.saveRecord.mockRejectedValue(new Error('сеть недоступна'));
            const store = makeOpenedStore([recordA, recordB]);

            const opened = await store.dispatch(openComplectVariant(recordB));

            const { openVariantSmartId, error, isBusy } = store.getState().complectVariant;
            expect(opened).toBe(false);
            expect(mocks.restoreSnapshotRecord).not.toHaveBeenCalled();
            expect(mocks.saveComposition).not.toHaveBeenCalled();
            expect(mocks.saveSnapshot).not.toHaveBeenCalled();
            expect(openVariantSmartId).toBe(VARIANT_A);
            expect(error).toContain('Вариант не открыт');
            expect(error).toContain('сеть недоступна');
            expect(isBusy).toBe(false);
        });

        it('повторное открытие уже открытого варианта не раскладывает запись', async () => {
            const store = makeOpenedStore([recordA, recordB]);

            const opened = await store.dispatch(openComplectVariant(recordA));

            expect(opened).toBe(true);
            expect(mocks.saveRecord).not.toHaveBeenCalled();
            expect(mocks.restoreSnapshotRecord).not.toHaveBeenCalled();
            expect(mocks.saveComposition).not.toHaveBeenCalled();
            expect(mocks.saveSnapshot).not.toHaveBeenCalled();
            expect(store.getState().complectVariant.openVariantSmartId).toBe(VARIANT_A);
        });

        it('раскладывается свежая запись из списка, переданная служит запасной', async () => {
            const fresh = makeRecord(VARIANT_B, 'Б: свежая');
            const stale = makeRecord(VARIANT_B, 'Б: устаревшая');
            const store = makeOpenedStore([recordA, fresh]);

            await store.dispatch(openComplectVariant(stale));
            expect(mocks.restoreSnapshotRecord).toHaveBeenLastCalledWith(fresh);

            // записи в списке нет — работает переданная
            const lonely = makeOpenedStore([recordA]);
            await lonely.dispatch(openComplectVariant(stale));
            expect(mocks.restoreSnapshotRecord).toHaveBeenLastCalledWith(stale);
        });

        it('варианты А и Б по очереди: вернувшись в А, видим всё, что в нём правили', async () => {
            const store = makeOpenedStore([recordA, recordB]);

            await store.dispatch(openComplectVariant(recordB));
            await store.dispatch(openComplectVariant(recordA));

            // при втором открытии А раскладывается запись, которую сервер вернул на сохранение
            const restoredLast = mocks.restoreSnapshotRecord.mock.lastCall?.[0];
            expect(restoredLast?.rows).toBe('сохранено: живое состояние');
            expect(store.getState().complectVariant.openVariantSmartId).toBe(VARIANT_A);
        });

        it('после открытия варианта слепок сделки сохраняется последним', async () => {
            const store = makeOpenedStore([recordA, recordB]);

            await store.dispatch(openComplectVariant(recordB));

            expect(mocks.saveSnapshot).toHaveBeenCalledTimes(1);
            expect(mocks.saveComposition).toHaveBeenCalledWith(
                DOMAIN,
                DEAL_ID,
                expect.objectContaining({ openVariantSmartId: VARIANT_B }),
            );
            // слепок пишется, когда указатель уже стоит на новом варианте,
            // иначе слушатель saveDone записал бы его состояние в уходящий вариант
            expect(callOrder(mocks.restoreSnapshotRecord)).toBeLessThan(
                callOrder(mocks.saveComposition),
            );
            expect(callOrder(mocks.saveComposition)).toBeLessThan(
                callOrder(mocks.saveSnapshot),
            );
        });

        it('открытого варианта нет: уходящему писать нечего, остальное идёт как обычно', async () => {
            const store = makeOpenedStore([recordA, recordB], null);

            const opened = await store.dispatch(openComplectVariant(recordB));

            expect(opened).toBe(true);
            expect(mocks.saveRecord).not.toHaveBeenCalled();
            expect(mocks.restoreSnapshotRecord).toHaveBeenCalledWith(recordB);
            expect(mocks.saveSnapshot).toHaveBeenCalledTimes(1);
        });

        it('раскладка записи упала: вариант не открыт, слепок сделки не тронут', async () => {
            mocks.restoreSnapshotRecord.mockImplementation(() => async () => {
                throw new Error('запись повреждена');
            });
            const store = makeOpenedStore([recordA, recordB]);

            const opened = await store.dispatch(openComplectVariant(recordB));

            expect(opened).toBe(false);
            expect(mocks.saveSnapshot).not.toHaveBeenCalled();
            expect(store.getState().complectVariant.openVariantSmartId).toBe(VARIANT_A);
            expect(store.getState().complectVariant.error).toBe('запись повреждена');
        });
    });

    describe('закрытие', () => {
        it('сохранение удалось: правки записаны в вариант, указатель сброшен', async () => {
            const store = makeOpenedStore([recordA, recordB]);

            const closed = await store.dispatch(closeComplectVariant());

            expect(closed).toBe(true);
            expect(mocks.saveRecord).toHaveBeenCalledWith(LIVE, VARIANT_A);
            expect(mocks.saveComposition).toHaveBeenCalledWith(
                DOMAIN,
                DEAL_ID,
                expect.objectContaining({ openVariantSmartId: null }),
            );
            expect(callOrder(mocks.saveRecord)).toBeLessThan(
                callOrder(mocks.saveComposition),
            );
            expect(store.getState().complectVariant.openVariantSmartId).toBeNull();
            expect(store.getState().complectVariant.isBusy).toBe(false);
        });

        it('сохранение упало: вариант остаётся открытым, ошибка показана', async () => {
            mocks.saveRecord.mockRejectedValue(new Error('сеть недоступна'));
            const store = makeOpenedStore([recordA, recordB]);

            const closed = await store.dispatch(closeComplectVariant());

            const { openVariantSmartId, error, isBusy } = store.getState().complectVariant;
            expect(closed).toBe(false);
            expect(openVariantSmartId).toBe(VARIANT_A);
            expect(mocks.saveComposition).not.toHaveBeenCalled();
            expect(error).toContain('Вариант не закрыт');
            expect(error).toContain('сеть недоступна');
            expect(isBusy).toBe(false);
        });
    });

    describe('запись открытого варианта', () => {
        it('свежая запись из ответа сервера заменяет старую в списке', async () => {
            const store = makeOpenedStore([recordA, recordB]);

            const saved = await store.dispatch(syncOpenComplectVariant());

            const { records } = store.getState().complectVariant;
            expect(saved).toBe(true);
            expect(records).toHaveLength(2);
            expect(records[0]?.variantSmartId).toBe(VARIANT_A);
            expect(records[0]?.rows).toBe('сохранено: живое состояние');
            expect(records[1]).toEqual(recordB);
        });

        it('записи варианта в списке не было: она добавляется в конец', async () => {
            const store = makeOpenedStore([recordB]);

            await store.dispatch(syncOpenComplectVariant());

            const { records } = store.getState().complectVariant;
            expect(records.map(record => record.variantSmartId)).toEqual([
                VARIANT_B,
                VARIANT_A,
            ]);
        });

        it('запись варианта слепок сделки не сохраняет: цикла с saveDone нет', async () => {
            const store = makeOpenedStore([recordA]);

            await store.dispatch(syncOpenComplectVariant());

            expect(mocks.saveRecord).toHaveBeenCalledTimes(1);
            expect(mocks.saveSnapshot).not.toHaveBeenCalled();
        });

        it('вариант не открыт или в конструкторе нет строк: писать нечего, ответ true', async () => {
            const closed = makeOpenedStore([recordA], null);
            expect(await closed.dispatch(syncOpenComplectVariant())).toBe(true);

            mocks.buildCurrentSnapshotV2.mockReturnValue(null);
            const empty = makeOpenedStore([recordA]);
            expect(await empty.dispatch(syncOpenComplectVariant())).toBe(true);
            expect(mocks.saveRecord).not.toHaveBeenCalled();
        });

        it('сервер отказал: ответ false, ошибка в слайсе', async () => {
            mocks.saveRecord.mockRejectedValue(new Error('сервер отказал'));
            const store = makeOpenedStore([recordA]);

            const saved = await store.dispatch(syncOpenComplectVariant());

            expect(saved).toBe(false);
            expect(store.getState().complectVariant.error).toBe('сервер отказал');
        });
    });

    describe('создание', () => {
        it('слепок сделки сохраняется после установки открытого варианта и перечитывания списка', async () => {
            const created = makeRecord(33, 'В: новый');
            mocks.createItem.mockResolvedValue({ id: 33, title: 'В', stageId: 'DT5_1:NEW' });
            mocks.listRecords.mockResolvedValue([recordA, recordB, created]);
            mocks.listItems.mockResolvedValue([]);
            mocks.getComposition.mockResolvedValue({
                ...DEFAULT_COMPLECT_COMPOSITION,
                openVariantSmartId: 33,
            });
            const store = makeOpenedStore([recordA, recordB]);

            await store.dispatch(createComplectVariant('В'));

            const state = store.getState().complectVariant;
            expect(mocks.saveRecord).toHaveBeenCalledWith(LIVE, 33);
            expect(state.openVariantSmartId).toBe(33);
            expect(state.records).toHaveLength(3);
            expect(mocks.saveSnapshot).toHaveBeenCalledTimes(1);
            expect(callOrder(mocks.saveComposition)).toBeLessThan(
                callOrder(mocks.listRecords),
            );
            expect(callOrder(mocks.listRecords)).toBeLessThan(
                callOrder(mocks.saveSnapshot),
            );
            expect(state.isBusy).toBe(false);
        });

        it('Битрикс не создал элемент: слепок сделки не трогается', async () => {
            mocks.createItem.mockResolvedValue(null);
            const store = makeOpenedStore([recordA]);

            await store.dispatch(createComplectVariant('В'));

            expect(mocks.saveSnapshot).not.toHaveBeenCalled();
            expect(store.getState().complectVariant.error).toBe(
                'Битрикс не создал элемент варианта',
            );
        });
    });
});

describe('варианты: слепок из ответа сервера в списке', () => {
    const initial = complectVariantReducer(undefined, { type: '@@init' });

    it('запись с тем же variantSmartId заменяет прежнюю на её месте', () => {
        const fresh = makeRecord(VARIANT_A, 'А: свежая');
        const state = [
            complectVariantActions.loaded({ records: [recordA, recordB], composition: null }),
            complectVariantActions.upsertRecord(fresh),
        ].reduce(complectVariantReducer, initial);

        expect(state.records).toEqual([fresh, recordB]);
    });

    it('новая запись встаёт в конец списка', () => {
        const state = [
            complectVariantActions.loaded({ records: [recordA], composition: null }),
            complectVariantActions.upsertRecord(recordB),
        ].reduce(complectVariantReducer, initial);

        expect(state.records).toEqual([recordA, recordB]);
    });

    it('запись без variantSmartId принадлежит сделке и в список вариантов не попадает', () => {
        const dealRecord: ComplectVariantRecordDto = { ...recordA, variantSmartId: null };
        const state = [
            complectVariantActions.loaded({ records: [recordA], composition: null }),
            complectVariantActions.upsertRecord(dealRecord),
        ].reduce(complectVariantReducer, initial);

        expect(state.records).toEqual([recordA]);
    });

    it('после сбоя варианты скрыты: одна запись не превращает пустой список в неполный', () => {
        const state = [
            complectVariantActions.loading(),
            complectVariantActions.failed('варианты не загружены'),
            complectVariantActions.upsertRecord(recordA),
        ].reduce(complectVariantReducer, initial);

        expect(state.records).toEqual([]);
    });
});
