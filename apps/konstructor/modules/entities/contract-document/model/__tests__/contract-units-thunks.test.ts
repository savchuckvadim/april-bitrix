import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppThunk, RootState } from '@/modules/app/model/store';
import { COMPLECT_MODE } from '../../../complect-variant/model/dto';
import { recordOf } from '../../../offer-document/lib/__fixtures__/variant-records';
import {
    OPEN_VARIANT_ID,
    OTHER_VARIANT_ID,
    contractUnitsState,
    twoVariantRecords,
} from '../../lib/__fixtures__/contract-units-state';
import type {
    ContractGenerateRequest,
    ContractSpecificationFormRequest,
    ContractSpecificationFormResponse,
    ContractSpecificationItem,
} from '../dto';
import { contractDocumentActions, contractDocumentReducer } from '../ContractDocumentSlice';
import {
    generateContractUnit,
    generateContractUnits,
    initContractDocument,
} from '../ContractDocumentThunk';

/**
 * Формы и формирование договоров по единицам. Сеть и сохранение слепка
 * подменены: проверяются порядок вызовов, запросы и итог в сторе.
 */

interface GenerateReply {
    link: string;
    documentName: string;
    savedToDisk: boolean;
}

const mocks = vi.hoisted(() => ({
    specificationForm:
        vi.fn<(request: ContractSpecificationFormRequest) => Promise<ContractSpecificationFormResponse>>(),
    generate: vi.fn<(request: ContractGenerateRequest) => Promise<GenerateReply>>(),
    saveSnapshot: vi.fn<() => AppThunk<Promise<boolean>>>(),
}));

vi.mock('../../lib/api/contract-document-helper', () => ({
    ContractDocumentHelper: class {
        specificationForm = mocks.specificationForm;
        generate = mocks.generate;
    },
}));
vi.mock('../../../snapshot', async importOriginal => ({
    ...(await importOriginal<typeof import('../../../snapshot')>()),
    saveSnapshot: mocks.saveSnapshot,
}));

const specItem = (code: string, value: string): ContractSpecificationItem => ({
    type: 'string',
    name: code,
    isRequired: false,
    includes: [],
    group: 'specification',
    isActive: true,
    isDisable: false,
    order: 0,
    value,
    code,
});

/** Стор с настоящим слайсом договора; остальное состояние читают сборщики запросов. */
const makeStore = (initial: RootState) =>
    configureStore({
        reducer: (state: RootState = initial, action: UnknownAction): RootState => ({
            ...state,
            contractDocument: contractDocumentReducer(state.contractDocument, action),
        }),
        // состояние с каталогом тяжёлое, проверки неизменности и сериализуемости ему не нужны
        middleware: getDefault => getDefault({ immutableCheck: false, serializableCheck: false }),
    });

const multiState = () => contractUnitsState(COMPLECT_MODE.multi_contract, twoVariantRecords());

const generatedNumbers = () => mocks.generate.mock.calls.map(([request]) => request.contractNumber);

beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.specificationForm.mockImplementation(async request => ({
        contract: [],
        specification: [specItem('spec', `форма: ${request.contractType}`)],
    }));
    mocks.generate.mockImplementation(async request => ({
        link: `https://disk/${request.contractNumber || 'без-номера'}`,
        documentName: `Договор ${request.contractNumber}`,
        savedToDisk: true,
    }));
    mocks.saveSnapshot.mockImplementation(() => async () => true);
});

describe('вход на экран договора: формы единиц', () => {
    it('живая форма и формы единиц запрашиваются по одной, друг за другом', async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        mocks.specificationForm.mockImplementation(async () => {
            inFlight += 1;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await Promise.resolve();
            inFlight -= 1;
            return { contract: [], specification: [specItem('spec', 'значение')] };
        });
        const store = makeStore(multiState());

        await store.dispatch(initContractDocument());

        expect(mocks.specificationForm).toHaveBeenCalledTimes(3);
        expect(maxInFlight).toBe(1);
        const { units, formStatus } = store.getState().contractDocument;
        expect(formStatus).toBe('ready');
        expect(Object.keys(units)).toEqual(['201', '202']);
        expect(units['201']?.formStatus).toBe('ready');
        expect(units['202']?.specification).toHaveLength(1);
    });

    it('форма каждой единицы строится по набору её варианта', async () => {
        const store = makeStore(multiState());
        await store.dispatch(initContractDocument());
        const complects = mocks.specificationForm.mock.calls.map(([request]) => JSON.stringify(request.complect));
        // живой набор и единица открытого варианта совпадают, слепок другого варианта даёт другой комплект
        expect(complects[1]).toBe(complects[0]);
        expect(complects[2]).not.toBe(complects[0]);
    });

    it('сбой формы одной единицы пишется в неё, остальные загружаются', async () => {
        mocks.specificationForm
            .mockResolvedValueOnce({ contract: [], specification: [] })
            .mockRejectedValueOnce(new Error('бэк недоступен'))
            .mockResolvedValueOnce({ contract: [], specification: [specItem('spec', 'v')] });
        const store = makeStore(multiState());

        await store.dispatch(initContractDocument());

        const { units } = store.getState().contractDocument;
        expect(units['201']).toMatchObject({ formStatus: 'error', formError: 'бэк недоступен' });
        expect(units['202']?.formStatus).toBe('ready');
    });

    it('состояние единиц, которых нет среди участников, удаляется', async () => {
        const initial = multiState();
        const store = makeStore({
            ...initial,
            contractDocument: contractDocumentReducer(
                initial.contractDocument,
                contractDocumentActions.unitContractNumber({ key: '999', value: 'старый' }),
            ),
        });

        await store.dispatch(initContractDocument());

        expect(Object.keys(store.getState().contractDocument.units)).toEqual(['201', '202']);
    });

    it('единиц нет (режим «по одному»): запрашивается только живая форма', async () => {
        const store = makeStore(contractUnitsState(COMPLECT_MODE.compare, twoVariantRecords()));

        await store.dispatch(initContractDocument());

        expect(mocks.specificationForm).toHaveBeenCalledTimes(1);
        expect(store.getState().contractDocument.units).toEqual({});
    });
});

describe('формирование договоров единиц', () => {
    it('все единицы по очереди: у каждой свой номер, спецификация и слепок перед формированием', async () => {
        const store = makeStore(multiState());
        await store.dispatch(initContractDocument());
        store.dispatch(contractDocumentActions.unitContractNumber({ key: '201', value: ' 1/А ' }));
        store.dispatch(contractDocumentActions.unitContractNumber({ key: '202', value: '2/Б' }));
        store.dispatch(contractDocumentActions.unitSpecificationValue({ key: '202', code: 'spec', value: 'правка' }));

        const allDone = await store.dispatch(generateContractUnits());

        expect(allDone).toBe(true);
        expect(generatedNumbers()).toEqual(['1/А', '2/Б']);
        const items = mocks.generate.mock.calls.map(([request]) => request.contractSpecificationState.items[0]?.value);
        expect(items).toEqual([expect.stringContaining('форма'), 'правка']);
        expect(mocks.saveSnapshot).toHaveBeenCalledTimes(2);
        const [firstSave] = mocks.saveSnapshot.mock.invocationCallOrder;
        const [firstGenerate] = mocks.generate.mock.invocationCallOrder;
        expect(firstSave).toBeLessThan(firstGenerate!);
        const { units, generate } = store.getState().contractDocument;
        expect(units['201']?.generate).toMatchObject({ status: 'done', link: 'https://disk/1/А', savedToDisk: true });
        expect(units['202']?.generate).toMatchObject({ status: 'done', link: 'https://disk/2/Б' });
        // договор живого состояния не формировался
        expect(generate.status).toBe('idle');
    });

    it('договор каждой единицы собран по набору её варианта', async () => {
        const store = makeStore(multiState());
        await store.dispatch(generateContractUnits());
        const complects = mocks.generate.mock.calls.map(([request]) => JSON.stringify(request.complect));
        expect(complects).toHaveLength(2);
        expect(complects[1]).not.toBe(complects[0]);
    });

    it('сбой одной из двух не останавливает вторую: итог false, ошибка у своей единицы', async () => {
        mocks.generate
            .mockRejectedValueOnce(new Error('шаблон договора не найден'))
            .mockResolvedValueOnce({ link: 'https://disk/2', documentName: 'Договор 2', savedToDisk: false });
        const store = makeStore(multiState());

        const allDone = await store.dispatch(generateContractUnits());

        expect(allDone).toBe(false);
        expect(mocks.generate).toHaveBeenCalledTimes(2);
        const { units } = store.getState().contractDocument;
        expect(units['201']?.generate).toMatchObject({ status: 'error', error: 'шаблон договора не найден' });
        expect(units['202']?.generate).toMatchObject({ status: 'done', link: 'https://disk/2', savedToDisk: false });
    });

    it('сбой второй единицы: первая остаётся готовой', async () => {
        mocks.generate
            .mockResolvedValueOnce({ link: 'https://disk/1', documentName: 'Договор 1', savedToDisk: true })
            .mockRejectedValueOnce(new Error('Диск недоступен'));
        const store = makeStore(multiState());

        expect(await store.dispatch(generateContractUnits())).toBe(false);

        const { units } = store.getState().contractDocument;
        expect(units['201']?.generate.status).toBe('done');
        expect(units['202']?.generate).toMatchObject({ status: 'error', error: 'Диск недоступен' });
    });

    it('одна единица: договор только её', async () => {
        const store = makeStore(multiState());
        store.dispatch(contractDocumentActions.unitContractNumber({ key: '202', value: '2/Б' }));

        const done = await store.dispatch(generateContractUnit('202'));

        expect(done).toBe(true);
        expect(generatedNumbers()).toEqual(['2/Б']);
        expect(store.getState().contractDocument.units['201']).toBeUndefined();
    });

    it('участник без слепка блокирует формирование: запросов нет, текст блокера у единиц', async () => {
        const state = contractUnitsState(COMPLECT_MODE.multi_contract, [
            recordOf(1, OPEN_VARIANT_ID, 'ur'),
            recordOf(2, OTHER_VARIANT_ID, 'ur'),
            recordOf(4, 204, 'ur', '{broken'),
        ]);
        const store = makeStore(state);

        const allDone = await store.dispatch(generateContractUnits());

        expect(allDone).toBe(false);
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(mocks.saveSnapshot).not.toHaveBeenCalled();
        expect(store.getState().contractDocument.units['201']?.generate.error).toContain('Вариант «Вариант 204»');
    });

    it('единица вышла из участников: ошибка у неё, запроса нет', async () => {
        const store = makeStore(multiState());

        const done = await store.dispatch(generateContractUnit('999'));

        expect(done).toBe(false);
        expect(mocks.generate).not.toHaveBeenCalled();
        expect(store.getState().contractDocument.units['999']?.generate).toMatchObject({
            status: 'error',
            error: 'Вариант больше не участвует в документах',
        });
    });

    it('единиц нет: «все» ничего не формирует и возвращает false', async () => {
        const store = makeStore(contractUnitsState(COMPLECT_MODE.compare, twoVariantRecords()));

        expect(await store.dispatch(generateContractUnits())).toBe(false);
        expect(mocks.generate).not.toHaveBeenCalled();
    });

    it('сбой сохранения слепка не останавливает формирование, как у живого договора', async () => {
        mocks.saveSnapshot.mockImplementation(() => async () => false);
        const store = makeStore(multiState());

        expect(await store.dispatch(generateContractUnits())).toBe(true);
        expect(mocks.generate).toHaveBeenCalledTimes(2);
    });
});
