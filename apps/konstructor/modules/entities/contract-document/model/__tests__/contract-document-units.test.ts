import { describe, expect, it } from 'vitest';
import { contractDocumentActions, contractDocumentReducer, type ContractDocumentState } from '../ContractDocumentSlice';
import type { ContractSpecificationItem } from '../dto';

/** Редьюсеры договорных единиц: у каждой своя форма, спецификация, номер и результат. */

const initial = contractDocumentReducer(undefined, { type: '@@init' });
const run = (
    state: ContractDocumentState,
    ...actions: Parameters<typeof contractDocumentReducer>[1][]
): ContractDocumentState => actions.reduce(contractDocumentReducer, state);

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

const loadUnit = (key: string, value = 'исходное') =>
    contractDocumentActions.unitFormLoaded({ key, contractForm: [], specification: [specItem('s1', value)] });

describe('договорные единицы: форма спецификации', () => {
    it('единиц в начальном состоянии нет', () => {
        expect(initial.units).toEqual({});
    });

    it('загрузка: единица заводится, статус loading, затем ready со спецификацией', () => {
        const loading = run(initial, contractDocumentActions.unitFormLoading({ key: '201' }));
        expect(loading.units['201']).toMatchObject({ formStatus: 'loading', formError: null, specification: [] });
        const ready = run(loading, loadUnit('201'));
        expect(ready.units['201']?.formStatus).toBe('ready');
        expect(ready.units['201']?.specification.map(item => item.value)).toEqual(['исходное']);
    });

    it('сбой загрузки: статус error и текст у этой единицы, остальные не затронуты', () => {
        const state = run(
            initial,
            loadUnit('202'),
            contractDocumentActions.unitFormFailed({ key: '201', error: 'форма не загружена' }),
        );
        expect(state.units['201']).toMatchObject({ formStatus: 'error', formError: 'форма не загружена' });
        expect(state.units['202']?.formStatus).toBe('ready');
    });

    it('новая загрузка снимает прежнюю ошибку', () => {
        const state = run(
            initial,
            contractDocumentActions.unitFormFailed({ key: '201', error: 'сбой' }),
            contractDocumentActions.unitFormLoading({ key: '201' }),
        );
        expect(state.units['201']).toMatchObject({ formStatus: 'loading', formError: null });
    });

    it('единицы живут отдельно от живой формы договора', () => {
        const state = run(initial, loadUnit('201'));
        expect(state.formStatus).toBe('idle');
        expect(state.specification).toEqual([]);
    });
});

describe('договорные единицы: правки менеджера', () => {
    it('значение спецификации правится только у своей единицы', () => {
        const state = run(
            initial,
            loadUnit('201'),
            loadUnit('202'),
            contractDocumentActions.unitSpecificationValue({ key: '201', code: 's1', value: 'правка' }),
        );
        expect(state.units['201']?.specification[0]?.value).toBe('правка');
        expect(state.units['202']?.specification[0]?.value).toBe('исходное');
    });

    it('правка значения в единице без состояния ничего не заводит', () => {
        const state = run(initial, contractDocumentActions.unitSpecificationValue({ key: '999', code: 's1', value: 'х' }));
        expect(state.units).toEqual({});
    });

    it('номер договора у каждой единицы свой и не трогает номер живого договора', () => {
        const state = run(
            initial,
            contractDocumentActions.setContractNumber('живой'),
            contractDocumentActions.unitContractNumber({ key: '201', value: '1/А' }),
            contractDocumentActions.unitContractNumber({ key: '202', value: '2/Б' }),
        );
        expect(state.units['201']?.contractNumber).toBe('1/А');
        expect(state.units['202']?.contractNumber).toBe('2/Б');
        expect(state.contractNumber).toBe('живой');
    });
});

describe('договорные единицы: формирование', () => {
    const done = { key: '201', link: 'https://disk/doc', documentName: 'Договор 1', savedToDisk: true };

    it('начало, успех: статус, ссылка и имя файла у единицы', () => {
        const started = run(initial, contractDocumentActions.unitGenerateStarted({ key: '201' }));
        expect(started.units['201']?.generate.status).toBe('generating');
        const finished = run(started, contractDocumentActions.unitGenerateDone(done));
        expect(finished.units['201']?.generate).toMatchObject({
            status: 'done',
            link: 'https://disk/doc',
            documentName: 'Договор 1',
            savedToDisk: true,
            error: null,
        });
    });

    it('сбой одной единицы не задевает результат другой', () => {
        const state = run(
            initial,
            contractDocumentActions.unitGenerateDone(done),
            contractDocumentActions.unitGenerateFailed({ key: '202', error: 'шаблон не найден' }),
        );
        expect(state.units['201']?.generate.status).toBe('done');
        expect(state.units['202']?.generate).toMatchObject({ status: 'error', error: 'шаблон не найден', link: null });
    });

    it('повторное формирование сбрасывает прежний результат', () => {
        const state = run(
            initial,
            contractDocumentActions.unitGenerateDone(done),
            contractDocumentActions.unitGenerateStarted({ key: '201' }),
        );
        expect(state.units['201']?.generate).toMatchObject({ status: 'generating', link: null, documentName: null });
    });

    it('результат живого договора не меняется', () => {
        const state = run(initial, contractDocumentActions.unitGenerateDone(done));
        expect(state.generate.status).toBe('idle');
    });
});

describe('договорные единицы: устаревание, чистка и сброс', () => {
    it('formStale помечает устаревшими формы единиц и живую форму', () => {
        const state = run(
            initial,
            contractDocumentActions.formLoaded({ contractForm: [], specification: [specItem('live', 'v')] }),
            loadUnit('201'),
            contractDocumentActions.unitFormFailed({ key: '202', error: 'сбой' }),
            contractDocumentActions.formStale(),
        );
        expect(state.formStatus).toBe('idle');
        expect(state.units['201']?.formStatus).toBe('idle');
        // ошибка остаётся ошибкой: устаревает только готовая форма
        expect(state.units['202']?.formStatus).toBe('error');
        // правки менеджера в спецификации не стираются, их заменит следующая загрузка
        expect(state.units['201']?.specification).toHaveLength(1);
    });

    it('unitsRetained оставляет только единицы среди участников', () => {
        const state = run(
            initial,
            loadUnit('201'),
            loadUnit('202'),
            contractDocumentActions.unitContractNumber({ key: '203', value: '3' }),
            contractDocumentActions.unitsRetained(['202']),
        );
        expect(Object.keys(state.units)).toEqual(['202']);
        expect(state.units['202']?.formStatus).toBe('ready');
    });

    it('unitsRetained с пустым списком чистит все единицы', () => {
        const state = run(initial, loadUnit('201'), contractDocumentActions.unitsRetained([]));
        expect(state.units).toEqual({});
    });

    it('reset чистит всё: живой договор и единицы', () => {
        const state = run(
            initial,
            contractDocumentActions.setContractNumber('живой'),
            loadUnit('201'),
            contractDocumentActions.unitContractNumber({ key: '201', value: '1' }),
            contractDocumentActions.reset(),
        );
        expect(state).toEqual(initial);
        expect(state.units).toEqual({});
    });
});
