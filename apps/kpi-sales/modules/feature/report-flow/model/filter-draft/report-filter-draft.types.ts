import type {
    FilterInnerCode,
    ReportPeriod,
} from '@/modules/entities/report/model/types/report/report-type';

/** Значения фильтра отчёта: период, выбранные сотрудники и действия. */
export interface ReportFilterValues {
    date: ReportPeriod;
    /** ID выбранных сотрудников. Пусто — «все видимые» (см. resolveDraftUsers). */
    userIds: number[];
    actionCodes: FilterInnerCode[];
}

/**
 * Черновик фильтра отчёта: пока панель фильтров открыта, она правит его, а не
 * действующий фильтр (state.report.date/filter/actions, state.department.current).
 * В действующий фильтр черновик переходит одним действием — «Применить».
 */
export interface ReportFilterDraftState extends ReportFilterValues {
    /** Панель фильтров открыта (черновик действует). */
    isOpen: boolean;
}
