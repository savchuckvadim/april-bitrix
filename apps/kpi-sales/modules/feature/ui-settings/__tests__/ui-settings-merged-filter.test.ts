import { describe, expect, it } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
    mergedReportActions,
    mergedReportReducer,
} from '@/modules/feature/merged-kpi-calling-report/model/MergedReportSlice';
import type { UiSettingsBlob } from '../lib/ui-settings.types';
import {
    applyStoredMergedFilter,
    toStoredMergedFilter,
} from '../lib/ui-settings-merged-filter.util';

/*
 * Выбор объединённого отчёта в блобе UI-настроек — единственное место его
 * хранения. Блобы, уже лежащие на сервере, несут и выбор сотрудников
 * (selectedUsers): он больше не применяется и не пишется — сотрудников
 * выбирает главный фильтр отчёта.
 */

const makeStore = () =>
    configureStore({ reducer: { mergedReport: mergedReportReducer } });

/** Блоб, записанный прежней версией: выбраны и сотрудники, и показатели. */
const OLD_BLOB: UiSettingsBlob = {
    version: 1,
    updatedAt: '2026-11-01T10:00:00.000Z',
    mergedFilter: {
        selectedUsers: [1, 2, 3],
        selectedActions: ['Звонки', 'Встречи'],
    },
};

describe('чтение блоба — applyStoredMergedFilter', () => {
    it('старый блоб: сотрудники не применяются, показатели применяются', () => {
        const store = makeStore();

        applyStoredMergedFilter(OLD_BLOB.mergedFilter, store.dispatch);

        expect(store.getState().mergedReport.selectedUsers).toEqual([]);
        expect(store.getState().mergedReport.selectedActions).toEqual([
            'Звонки',
            'Встречи',
        ]);
    });

    it('выбор сотрудников, уже стоявший в слайсе, чтением блоба не меняется', () => {
        const store = makeStore();
        store.dispatch(mergedReportActions.setSelectedUsers([7]));

        applyStoredMergedFilter(OLD_BLOB.mergedFilter, store.dispatch);

        expect(store.getState().mergedReport.selectedUsers).toEqual([7]);
    });

    it('пустые показатели в блобе — «все»: перекрывают суженный выбор', () => {
        const store = makeStore();
        store.dispatch(mergedReportActions.setSelectedActions(['Звонки']));

        applyStoredMergedFilter(
            { selectedUsers: [], selectedActions: [] },
            store.dispatch,
        );

        expect(store.getState().mergedReport.selectedActions).toEqual([]);
    });

    it('в блобе нет поля выбора — слайс не меняется', () => {
        const store = makeStore();
        store.dispatch(mergedReportActions.setSelectedActions(['Звонки']));

        applyStoredMergedFilter(undefined, store.dispatch);

        expect(store.getState().mergedReport.selectedActions).toEqual([
            'Звонки',
        ]);
    });

    it('показатели без списка (повреждённый блоб) — «все», без ошибки', () => {
        const store = makeStore();
        store.dispatch(mergedReportActions.setSelectedActions(['Звонки']));
        const broken = {
            selectedUsers: [],
        } as unknown as UiSettingsBlob['mergedFilter'];

        applyStoredMergedFilter(broken, store.dispatch);

        expect(store.getState().mergedReport.selectedActions).toEqual([]);
    });
});

describe('запись блоба — toStoredMergedFilter', () => {
    it('показатели пишутся, сотрудники — всегда пустыми', () => {
        const store = makeStore();
        // Выбор сотрудников в слайсе бывает только на публичной странице.
        store.dispatch(mergedReportActions.setSelectedUsers([4, 5]));
        store.dispatch(mergedReportActions.setSelectedActions(['Звонки']));

        expect(toStoredMergedFilter(store.getState().mergedReport)).toEqual({
            selectedUsers: [],
            selectedActions: ['Звонки'],
        });
    });

    it('форма поля прежняя: оба ключа на месте, даже когда выбор пуст', () => {
        const stored = toStoredMergedFilter({ selectedActions: [] });

        expect(stored).toEqual({ selectedUsers: [], selectedActions: [] });
    });

    it('записанный блоб читается обратно без потерь', () => {
        const source = makeStore();
        source.dispatch(
            mergedReportActions.setSelectedActions(['Звонки', 'Встречи']),
        );
        const target = makeStore();

        applyStoredMergedFilter(
            toStoredMergedFilter(source.getState().mergedReport),
            target.dispatch,
        );

        expect(target.getState().mergedReport).toEqual({
            selectedUsers: [],
            selectedActions: ['Звонки', 'Встречи'],
        });
    });
});
