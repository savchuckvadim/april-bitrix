import type { BXUser } from '@workspace/bx';
import type { RatingDataset } from '@/modules/feature/report-rating';
import {
    financeEmployeeName,
    type FinanceClosedReport,
} from '@/modules/entities/finance';

/** Коды показателей финансового рейтинга. */
export const FINANCE_RATING_CODES = {
    advance: 'finance_advance',
    monthly: 'finance_monthly',
    expected: 'finance_expected',
    deals: 'finance_deals',
} as const;

/**
 * Датасет для EntityRatingChart: денежные суммы по сотрудникам —
 * секционируются штатным buildSectionRating (значения складываются).
 */
export const buildFinanceRatingDataset = (
    report: FinanceClosedReport,
    departmentItems: BXUser[],
): RatingDataset => ({
    actions: [
        { code: FINANCE_RATING_CODES.advance, name: 'Аванс, ₽' },
        { code: FINANCE_RATING_CODES.monthly, name: 'Месячная сумма, ₽' },
        { code: FINANCE_RATING_CODES.expected, name: 'Ожидаемая, ₽' },
        { code: FINANCE_RATING_CODES.deals, name: 'Сделок' },
    ],
    rows: report.employees.map(employee => ({
        userId: employee.assignedId,
        name: financeEmployeeName(departmentItems, employee.assignedId),
        values: {
            [FINANCE_RATING_CODES.advance]: employee.advanceAmount,
            [FINANCE_RATING_CODES.monthly]: employee.monthlyAmount,
            [FINANCE_RATING_CODES.expected]: employee.expectedContractAmount,
            [FINANCE_RATING_CODES.deals]: employee.dealsCount,
        },
    })),
});
