import type { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import {
    mergedReportActions,
    type MergedReportState,
} from '@/modules/feature/merged-kpi-calling-report/model/MergedReportSlice';
import type { StoredMergedFilter } from './ui-settings.types';

/**
 * Выбор объединённого отчёта для записи в блоб. Сотрудники не пишутся:
 * их выбирает главный фильтр, а поле selectedUsers осталось в блобе только
 * ради формы — прежних блобов на сервере.
 */
export const toStoredMergedFilter = (
    merged: Pick<MergedReportState, 'selectedActions'>,
): StoredMergedFilter => ({
    selectedUsers: [],
    selectedActions: [...merged.selectedActions],
});

/**
 * Применение выбора из блоба: показатели переносятся в слайс, сотрудники
 * игнорируются — выбор сотрудников, сохранённый старой версией, на отчёт
 * больше не влияет. Пустые показатели тоже применяются («все»): новая
 * настройка с другого устройства должна перекрыть локальную суженную.
 */
export const applyStoredMergedFilter = (
    stored: StoredMergedFilter | undefined,
    dispatch: Dispatch<UnknownAction>,
): void => {
    if (!stored) return;
    const actions = Array.isArray(stored.selectedActions)
        ? stored.selectedActions.map(String)
        : [];
    dispatch(mergedReportActions.setSelectedActions(actions));
};
