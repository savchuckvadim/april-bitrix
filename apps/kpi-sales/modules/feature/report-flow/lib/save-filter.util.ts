import type {
    ReportFilterSaveRequestDto,
    SavedReportFilterDto,
} from '@workspace/nest-kpi-report-sales-api';
import type { RootState } from '@/modules/app/model/store';
import {
    EReportDateMode,
    ReportDateType,
    type ReportPeriod,
} from '@/modules/entities/report/model/types/report/report-type';
import type { SalesDepartment } from '@/modules/entities/department/model';
import { buildSelectionV2 } from '@/modules/entities/department/lib/utils/selection.util';
import type { ReportFilterValues } from '../model/filter-draft/report-filter-draft.types';
import { readActiveFilterValues, resolveDraftUsers } from './filter-draft.util';

/** Период → формат сохранённого фильтра (v2-режим custom ↔ фронтовый range). */
export const toSavedDates = (
    date: ReportPeriod,
): SavedReportFilterDto['dates'] => {
    if (date.mode === EReportDateMode.RANGE) {
        return {
            mode: 'custom',
            from: date[ReportDateType.FROM],
            to: date[ReportDateType.TO],
        };
    }
    return { mode: date.mode as SavedReportFilterDto['dates']['mode'] };
};

/**
 * Значения, которые сохраняет кнопка «Сохранить фильтр». Кнопка видна только
 * при открытой панели, поэтому пока открыт черновик — сохраняется он (с тем же
 * правилом «никто не выбран = все видимые», что и при «Применить»), иначе —
 * действующий фильтр.
 */
export const selectFilterValuesToSave = (
    state: Pick<RootState, 'report' | 'department' | 'reportFilterDraft'>,
): ReportFilterValues => {
    const { report, department, reportFilterDraft: draft } = state;
    if (!draft.isOpen) {
        return readActiveFilterValues(report, department.current);
    }
    return {
        date: draft.date,
        userIds: resolveDraftUsers(draft.userIds, department.items).map(user =>
            Number(user.ID),
        ),
        actionCodes: draft.actionCodes,
    };
};

/**
 * Запрос сохранения фильтра в формате v2 (structural selection).
 * legacyUserIds заполняется всегда — бэк зеркалирует старые колонки,
 * поэтому legacy online-флоу остаётся рабочим (путь отката).
 */
export const buildSaveFilterDto = (
    owner: { domain: string; userId: number },
    values: ReportFilterValues,
    departments: SalesDepartment[],
): ReportFilterSaveRequestDto => {
    const selectedIds = new Set(values.userIds);
    return {
        domain: owner.domain,
        userId: owner.userId,
        filter: {
            version: 2,
            actions: values.actionCodes,
            dates: toSavedDates(values.date),
            selection: buildSelectionV2(departments, selectedIds),
            legacyUserIds: [...selectedIds],
        },
    };
};
