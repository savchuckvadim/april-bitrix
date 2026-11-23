import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppThunk, RootState } from '@/modules/app/model/store';
import oldInit from '../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../catalog';
import { buildGarantRow, buildProductRows, createSet, upsertRow, type BitrixProductRow } from '../../row-set';
import type { SnapshotV2 } from '../../snapshot/model/types';
import type { ComplectVariantItem } from '../lib/api/complect-variant-helper';
import { complectVariantActions, complectVariantReducer } from './ComplectVariantSlice';
import {
    closeComplectVariant,
    createComplectVariant,
    openComplectVariant,
    syncOpenComplectVariant,
} from './ComplectVariantThunk';
import { DEFAULT_COMPLECT_COMPOSITION, type ComplectComposition, type ComplectVariantRecordDto } from './dto';

/**
 * Товарные строки элемента смарта варианта: пишутся после слепка открытого
 * варианта и при создании варианта; сбой записи строк остаётся предупреждением
 * и сохранение варианта не отменяет. Сеть и Битрикс подменены.
 */
const mocks = vi.hoisted(() => ({
    saveRecord: vi.fn<(snapshot: SnapshotV2, variantSmartId: number) => Promise<ComplectVariantRecordDto>>(),
    createItem: vi.fn<(entityTypeId: number, dealId: number, title: string) => Promise<ComplectVariantItem | null>>(),
    listRecords: vi.fn<(domain: string, dealId: number) => Promise<ComplectVariantRecordDto[]>>(),
    listItems: vi.fn<(entityTypeId: number, dealId: number) => Promise<ComplectVariantItem[]>>(),
    getComposition: vi.fn<(domain: string, dealId: number) => Promise<ComplectComposition | null>>(),
    saveComposition: vi.fn<(domain: string, dealId: number, settings: ComplectComposition | null) => Promise<void>>(),
    writeProductRows:
        vi.fn<
            (entityTypeId: number, variantSmartId: number, rows: readonly BitrixProductRow[]) => Promise<void>
        >(),
    buildCurrentSnapshotV2: vi.fn<(state: RootState) => SnapshotV2 | null>(),
    restoreSnapshotRecord: vi.fn<(record: ComplectVariantRecordDto) => AppThunk<Promise<void>>>(),
    saveSnapshot: vi.fn<() => AppThunk<Promise<boolean>>>(),
    entityTypeId: vi.fn<() => number | null>(),
}));

vi.mock('../lib/api/complect-variant-helper', () => ({
    ComplectVariantHelper: class {
        saveRecord = mocks.saveRecord;
        createItem = mocks.createItem;
        listRecords = mocks.listRecords;
        listItems = mocks.listItems;
        getComposition = mocks.getComposition;
        saveComposition = mocks.saveComposition;
        writeProductRows = mocks.writeProductRows;
    },
}));
vi.mock('../../snapshot', () => ({
    buildCurrentSnapshotV2: mocks.buildCurrentSnapshotV2,
    restoreSnapshotRecord: mocks.restoreSnapshotRecord,
    saveSnapshot: mocks.saveSnapshot,
}));
vi.mock('../../portal', () => ({
    getComplectVariantPbxSmartEntityId: mocks.entityTypeId,
}));

const DOMAIN = 'portal.bitrix24.ru';
const DEAL_ID = 7;
const VARIANT_A = 11;
const SMART_TYPE_ID = 1038;
const NEW_VARIANT = 33;

const catalog = catalogFromOldInit(oldInit);
const general = upsertRow(
    upsertRow(
        createSet('general', 'general'),
        buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'r1',
            setId: 'general',
            role: 'main',
            complectCode: 'buh',
            supplyCode: 'internet_5',
            contractCode: 'abonYear',
        })!,
    ),
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: 'r2',
        setId: 'general',
        role: 'additional',
        complectCode: 'expert',
        supplyCode: 'internet_5',
        contractCode: 'abonYear',
    })!,
);
const expectedRows = buildProductRows(general, catalog);

const makeRecord = (variantSmartId: number, rows: string): ComplectVariantRecordDto =>
    ({ id: variantSmartId * 10, dealId: DEAL_ID, domain: DOMAIN, variantSmartId, rows }) as ComplectVariantRecordDto;

const LIVE: SnapshotV2 = {
    schemaVersion: 2,
    dealId: DEAL_ID,
    domain: DOMAIN,
    userId: 1,
    serviceSmartId: null,
    regionCode: 'stv',
    contractCode: 'abonYear',
    supplyCode: 'internet_5',
    general,
    alternative: [],
    templateId: null,
    savedAt: 'живое состояние',
};

const VARIANT_B = 22;
const recordA = makeRecord(VARIANT_A, 'А: на входе');
const recordB = makeRecord(VARIANT_B, 'Б: на входе');

const app: Pick<RootState['app'], 'dealId' | 'domain'> = { dealId: DEAL_ID, domain: DOMAIN };
const portal: Pick<RootState['portal'], 'current'> = { current: null };
const catalogState: RootState['catalog'] = { catalog, loading: 'succeeded', error: null };

/** Стор с настоящим слайсом вариантов; остальным слайсам хватает того, что читают thunks. */
const makeStore = () => {
    const initial = {
        app,
        portal,
        catalog: catalogState,
        complectVariant: complectVariantReducer(undefined, { type: '@@init' }),
    } as RootState;
    return configureStore({
        reducer: (state: RootState = initial, action: UnknownAction): RootState => ({
            ...state,
            complectVariant: complectVariantReducer(state.complectVariant, action),
        }),
    });
};

/** Стор с загруженными вариантами, названием А из Битрикса и открытым А. */
const makeOpenedStore = (records: ComplectVariantRecordDto[] = [recordA]) => {
    const store = makeStore();
    store.dispatch(complectVariantActions.loaded({ records, composition: null }));
    store.dispatch(complectVariantActions.itemsLoaded([{ id: VARIANT_A, title: 'Бухгалтеру', stageId: 'DT1:NEW' }]));
    store.dispatch(complectVariantActions.setOpenVariant(VARIANT_A));
    return store;
};

const callOrder = (mock: { mock: { invocationCallOrder: number[] } }): number => {
    const [first] = mock.mock.invocationCallOrder;
    if (first === undefined) throw new Error('мок не вызывался');
    return first;
};

describe('товарные строки варианта', () => {
    beforeEach(() => {
        for (const mock of Object.values(mocks)) mock.mockReset();
        mocks.entityTypeId.mockReturnValue(SMART_TYPE_ID);
        mocks.buildCurrentSnapshotV2.mockReturnValue(LIVE);
        mocks.saveRecord.mockImplementation(async (snapshot, variantSmartId) =>
            makeRecord(variantSmartId, `сохранено: ${snapshot.savedAt}`),
        );
        mocks.writeProductRows.mockResolvedValue(undefined);
        mocks.saveComposition.mockResolvedValue(undefined);
        mocks.restoreSnapshotRecord.mockImplementation(() => async () => undefined);
        mocks.saveSnapshot.mockImplementation(() => async () => true);
    });

    describe('запись открытого варианта', () => {
        it('после слепка строки общего набора уходят в элемент варианта', async () => {
            const store = makeOpenedStore();

            const saved = await store.dispatch(syncOpenComplectVariant());

            expect(saved).toBe(true);
            expect(mocks.writeProductRows).toHaveBeenCalledTimes(1);
            expect(mocks.writeProductRows).toHaveBeenCalledWith(SMART_TYPE_ID, VARIANT_A, expectedRows);
            expect(expectedRows).toHaveLength(2);
            expect(callOrder(mocks.saveRecord)).toBeLessThan(callOrder(mocks.writeProductRows));
            expect(store.getState().complectVariant.error).toBeNull();
        });

        it('слепок не записался: строки в элемент не идут, ответ false', async () => {
            mocks.saveRecord.mockRejectedValue(new Error('сервер отказал'));
            const store = makeOpenedStore();

            const saved = await store.dispatch(syncOpenComplectVariant());

            expect(saved).toBe(false);
            expect(mocks.writeProductRows).not.toHaveBeenCalled();
            expect(store.getState().complectVariant.error).toBe('сервер отказал');
        });

        it('вариант не открыт: писать нечего, строки не идут', async () => {
            const store = makeOpenedStore();
            store.dispatch(complectVariantActions.setOpenVariant(null));

            await store.dispatch(syncOpenComplectVariant());

            expect(mocks.writeProductRows).not.toHaveBeenCalled();
        });

        it('сбой записи строк не роняет сохранение: слепок в списке, ответ true, предупреждение в слайсе', async () => {
            mocks.writeProductRows.mockRejectedValue(new Error('Нет прав на изменение элемента'));
            const store = makeOpenedStore();

            const saved = await store.dispatch(syncOpenComplectVariant());

            const state = store.getState().complectVariant;
            expect(saved).toBe(true);
            expect(state.error).toBe(
                'Товары варианта «Бухгалтеру» не записаны в Битрикс: Нет прав на изменение элемента',
            );
            expect(state.records).toHaveLength(1);
            expect(state.records[0]?.rows).toBe('сохранено: живое состояние');
            expect(state.status).toBe('ready');
            expect(state.openVariantSmartId).toBe(VARIANT_A);
            expect(state.isBusy).toBe(false);
        });

        it('названия варианта в Битриксе ещё нет: в предупреждении его номер', async () => {
            mocks.writeProductRows.mockRejectedValue(new Error('сеть недоступна'));
            const store = makeStore();
            store.dispatch(complectVariantActions.loaded({ records: [recordA], composition: null }));
            store.dispatch(complectVariantActions.setOpenVariant(VARIANT_A));

            await store.dispatch(syncOpenComplectVariant());

            expect(store.getState().complectVariant.error).toBe(
                `Товары варианта «Вариант ${VARIANT_A}» не записаны в Битрикс: сеть недоступна`,
            );
        });

        it('смарта нет на портале: строки не пишутся, предупреждения нет', async () => {
            mocks.entityTypeId.mockReturnValue(null);
            const store = makeOpenedStore();

            const saved = await store.dispatch(syncOpenComplectVariant());

            expect(saved).toBe(true);
            expect(mocks.writeProductRows).not.toHaveBeenCalled();
            expect(store.getState().complectVariant.error).toBeNull();
        });
    });

    describe('уход из варианта', () => {
        const WARNING = 'Товары варианта «Бухгалтеру» не записаны в Битрикс: Битрикс недоступен';

        it('открытие другого варианта: строки уходящего пишутся, предупреждение о сбое остаётся на экране', async () => {
            mocks.writeProductRows.mockRejectedValue(new Error('Битрикс недоступен'));
            const store = makeOpenedStore([recordA, recordB]);

            const opened = await store.dispatch(openComplectVariant(recordB));

            const state = store.getState().complectVariant;
            expect(opened).toBe(true);
            expect(mocks.writeProductRows).toHaveBeenCalledWith(SMART_TYPE_ID, VARIANT_A, expectedRows);
            expect(state.openVariantSmartId).toBe(VARIANT_B);
            expect(state.error).toBe(WARNING);
            expect(state.records.map(record => record.variantSmartId)).toEqual([VARIANT_A, VARIANT_B]);
            expect(state.isBusy).toBe(false);
        });

        it('открытие другого варианта без сбоя записи: ошибки нет', async () => {
            const store = makeOpenedStore([recordA, recordB]);

            await store.dispatch(openComplectVariant(recordB));

            expect(store.getState().complectVariant.error).toBeNull();
        });

        it('закрытие: предупреждение о сбое записи строк остаётся на экране, вариант закрыт', async () => {
            mocks.writeProductRows.mockRejectedValue(new Error('Битрикс недоступен'));
            const store = makeOpenedStore();

            const closed = await store.dispatch(closeComplectVariant());

            const state = store.getState().complectVariant;
            expect(closed).toBe(true);
            expect(state.openVariantSmartId).toBeNull();
            expect(state.error).toBe(WARNING);
        });

        it('следующий шаг упал со своей ошибкой: остаётся она, предупреждение её не заменяет', async () => {
            mocks.writeProductRows.mockRejectedValue(new Error('Битрикс недоступен'));
            mocks.saveComposition.mockRejectedValue(new Error('настройки не записались'));
            const store = makeOpenedStore();

            await store.dispatch(closeComplectVariant());

            expect(store.getState().complectVariant.error).toBe('настройки не записались');
        });
    });

    describe('создание варианта', () => {
        const prepareCreate = () => {
            const created = makeRecord(NEW_VARIANT, 'В: новый');
            mocks.createItem.mockResolvedValue({ id: NEW_VARIANT, title: 'Новый', stageId: 'DT1:NEW' });
            mocks.listRecords.mockResolvedValue([recordA, created]);
            mocks.listItems.mockResolvedValue([{ id: NEW_VARIANT, title: 'Новый', stageId: 'DT1:NEW' }]);
            mocks.getComposition.mockResolvedValue({ ...DEFAULT_COMPLECT_COMPOSITION, openVariantSmartId: NEW_VARIANT });
            return makeOpenedStore();
        };

        it('после создания строки общего набора пишутся в новый элемент', async () => {
            const store = prepareCreate();

            await store.dispatch(createComplectVariant('Новый'));

            expect(mocks.writeProductRows).toHaveBeenCalledTimes(1);
            expect(mocks.writeProductRows).toHaveBeenCalledWith(SMART_TYPE_ID, NEW_VARIANT, expectedRows);
            expect(callOrder(mocks.saveRecord)).toBeLessThan(callOrder(mocks.writeProductRows));
            expect(store.getState().complectVariant.openVariantSmartId).toBe(NEW_VARIANT);
            expect(store.getState().complectVariant.error).toBeNull();
            expect(store.getState().complectVariant.isBusy).toBe(false);
        });

        it('сбой записи строк вариант не отменяет: список, указатель и слепок сделки на месте, предупреждение видно', async () => {
            mocks.writeProductRows.mockRejectedValue(new Error('Битрикс недоступен'));
            const store = prepareCreate();

            await store.dispatch(createComplectVariant('Новый'));

            const state = store.getState().complectVariant;
            expect(state.error).toBe('Товары варианта «Новый» не записаны в Битрикс: Битрикс недоступен');
            expect(state.records.map(record => record.variantSmartId)).toEqual([VARIANT_A, NEW_VARIANT]);
            expect(state.status).toBe('ready');
            expect(state.openVariantSmartId).toBe(NEW_VARIANT);
            expect(mocks.saveSnapshot).toHaveBeenCalledTimes(1);
            expect(state.isBusy).toBe(false);
        });

        it('Битрикс не создал элемент: строки не пишутся', async () => {
            mocks.createItem.mockResolvedValue(null);
            const store = makeOpenedStore();

            await store.dispatch(createComplectVariant('Новый'));

            expect(mocks.writeProductRows).not.toHaveBeenCalled();
            expect(store.getState().complectVariant.error).toBe('Битрикс не создал элемент варианта');
        });
    });
});
