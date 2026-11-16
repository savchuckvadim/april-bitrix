import { describe, expect, it } from 'vitest';
import type { ComplectVariantItem } from '../lib/api/complect-variant-helper';
import {
    complectVariantActions,
    complectVariantReducer,
    selectVariantStagesLoading,
    type ComplectVariantState,
} from './ComplectVariantSlice';
import type { ComplectVariantRecordDto } from './dto';

const initial = complectVariantReducer(undefined, { type: '@@init' });
const run = (
    state: ComplectVariantState,
    ...actions: Parameters<typeof complectVariantReducer>[1][]
): ComplectVariantState => actions.reduce(complectVariantReducer, state);

const record = { id: 1, variantSmartId: 11 } as ComplectVariantRecordDto;
const item: ComplectVariantItem = { id: 11, title: 'Вариант А', stageId: 'DT1_1:NEW' };

describe('варианты: слепки и элементы Битрикса грузятся отдельно', () => {
    it('слепки пришли — вход уже знает про варианты, стадии ещё в пути', () => {
        const state = run(
            initial,
            complectVariantActions.loading(),
            complectVariantActions.loaded({ records: [record], composition: null }),
        );
        expect(state.status).toBe('ready');
        expect(state.itemsStatus).toBe('loading');
        expect(state.records).toHaveLength(1);
        // пока стадий нет, документы по вариантам собирать нельзя
        expect(selectVariantStagesLoading({ complectVariant: state })).toBe(true);
    });

    it('пришли и элементы — всё готово, запись закончена', () => {
        const state = run(
            initial,
            complectVariantActions.busy(true),
            complectVariantActions.loading(),
            complectVariantActions.loaded({ records: [record], composition: null }),
            complectVariantActions.itemsLoaded([item]),
        );
        expect(state.itemsStatus).toBe('ready');
        expect(state.items).toEqual([item]);
        expect(state.isBusy).toBe(false);
        expect(selectVariantStagesLoading({ complectVariant: state })).toBe(false);
    });

    it('кнопки заняты, пока не пришло и то и другое — в любом порядке', () => {
        const itemsFirst = run(
            initial,
            complectVariantActions.busy(true),
            complectVariantActions.loading(),
            complectVariantActions.itemsLoaded([item]),
        );
        expect(itemsFirst.isBusy).toBe(true);
        const recordsFirst = run(
            initial,
            complectVariantActions.busy(true),
            complectVariantActions.loading(),
            complectVariantActions.loaded({ records: [record], composition: null }),
        );
        expect(recordsFirst.isBusy).toBe(true);
    });

    it('Битрикс отказал — вариантов нет, даже если слепки пришли позже', () => {
        const state = run(
            initial,
            complectVariantActions.loading(),
            complectVariantActions.failed('стадии вариантов не загружены'),
            complectVariantActions.loaded({ records: [record], composition: null }),
        );
        expect(state.status).toBe('error');
        expect(state.records).toEqual([]);
        expect(selectVariantStagesLoading({ complectVariant: state })).toBe(false);
    });

    it('у сделки без вариантов ждать стадии незачем', () => {
        const state = run(
            initial,
            complectVariantActions.loading(),
            complectVariantActions.loaded({ records: [], composition: null }),
        );
        expect(selectVariantStagesLoading({ complectVariant: state })).toBe(false);
    });
});
