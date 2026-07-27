import type {
    FinanceClosedEmployee,
    FinanceClosedReport,
    FinanceClosedTotals,
    FinanceHotDeal,
    FinanceHotTotals,
} from '../model';

/** Нулевые итоги закрытых продаж (плейсхолдер до загрузки/при пустых данных). */
export const emptyClosedTotals = (): FinanceClosedTotals => ({
    dealsCount: 0,
    advanceAmount: 0,
    paidMonths: 0,
    monthlyAmount: 0,
    quantity: 0,
    expectedContractAmount: 0,
});

/** Итоги по подмножеству сотрудников (секции отделов/групп). */
export const recomputeTotals = (
    employees: FinanceClosedEmployee[],
): FinanceClosedTotals =>
    employees.reduce<FinanceClosedTotals>(
        (totals, employee) => ({
            dealsCount: totals.dealsCount + employee.dealsCount,
            advanceAmount: totals.advanceAmount + employee.advanceAmount,
            paidMonths: totals.paidMonths + employee.paidMonths,
            monthlyAmount: totals.monthlyAmount + employee.monthlyAmount,
            quantity: totals.quantity + employee.quantity,
            expectedContractAmount:
                totals.expectedContractAmount +
                employee.expectedContractAmount,
        }),
        emptyClosedTotals(),
    );

/**
 * Итоги горячих клиентов из ПРОИЗВОЛЬНОГО набора сделок — для клиентской
 * фильтрации (перспектива/стадия/с предложением) с пересчётом сводки.
 * Потенциальный аванс = Σ productRowsAmount; потенциал в месяц = Σ monthly.
 */
export const computeHotTotals = (
    deals: FinanceHotDeal[],
): FinanceHotTotals =>
    deals.reduce<FinanceHotTotals>(
        (totals, deal) => ({
            dealsCount: totals.dealsCount + 1,
            opportunityTotal: totals.opportunityTotal + deal.opportunity,
            productRowsAmountTotal:
                totals.productRowsAmountTotal + deal.productRowsAmount,
            monthlyAmountTotal: totals.monthlyAmountTotal + deal.monthlyAmount,
            paidMonthsTotal: totals.paidMonthsTotal + deal.paidMonths,
            quantityTotal: totals.quantityTotal + deal.quantity,
        }),
        {
            dealsCount: 0,
            opportunityTotal: 0,
            productRowsAmountTotal: 0,
            monthlyAmountTotal: 0,
            paidMonthsTotal: 0,
            quantityTotal: 0,
        },
    );

/** Срез отчёта по набору сотрудников (для секций разбивки). */
export const sliceReportByUserIds = (
    report: FinanceClosedReport,
    userIds: Set<number>,
): FinanceClosedEmployee[] =>
    report.employees.filter(employee => userIds.has(employee.assignedId));

/**
 * Отклонение от базы в процентах (для дельт сравнения периодов);
 * null — база нулевая/отсутствует, рендерится «—».
 */
export const deltaPercent = (
    current: number,
    base: number | null | undefined,
): number | null => {
    if (base === null || base === undefined || base === 0) return null;
    return ((current - base) / base) * 100;
};
