import type { BXUser } from '@workspace/bx';
import type { ReportState } from '@/modules/entities/report/model/report-slice';
import type { ReportFilterValues } from '../model/filter-draft/report-filter-draft.types';

/**
 * Значения действующего фильтра отчёта (то, что читают таблицы и запросы):
 * период и коды действий — из state.report, сотрудники — из
 * state.department.current. Возвращаются копии — состояние не разделяется.
 */
export const readActiveFilterValues = (
    report: Pick<ReportState, 'date' | 'filter'>,
    departmentCurrent: readonly BXUser[],
): ReportFilterValues => ({
    date: {
        from: report.date.from,
        to: report.date.to,
        mode: report.date.mode,
    },
    userIds: departmentCurrent.map(user => Number(user.ID)),
    actionCodes: [...report.filter],
});

const hasSameItems = <T>(a: readonly T[], b: readonly T[]): boolean => {
    const setA = new Set(a);
    const setB = new Set(b);
    return setA.size === setB.size && [...setA].every(item => setB.has(item));
};

/**
 * Отличается ли черновик от действующего фильтра. Сотрудники и действия
 * сравниваются как наборы (порядок не важен), пустой выбор сотрудников
 * сравнивается как есть — он не раскрывается в «всех видимых».
 */
export const isFilterDraftChanged = (
    draft: ReportFilterValues,
    active: ReportFilterValues,
): boolean =>
    draft.date.mode !== active.date.mode ||
    draft.date.from !== active.date.from ||
    draft.date.to !== active.date.to ||
    !hasSameItems(draft.userIds, active.userIds) ||
    !hasSameItems(draft.actionCodes, active.actionCodes);

/**
 * Сотрудники, которых черновик переносит в действующий фильтр: выбранные из
 * видимых. Пустой выбор (или выбор, которого нет среди видимых) — «все
 * видимые»: сервер при пустом списке и так считает всех, и таблица должна
 * показывать то же самое.
 */
export const resolveDraftUsers = (
    userIds: readonly number[],
    visibleUsers: readonly BXUser[],
): BXUser[] => {
    const selected = new Set(userIds);
    const users = visibleUsers.filter(user => selected.has(Number(user.ID)));
    return users.length ? users : [...visibleUsers];
};
