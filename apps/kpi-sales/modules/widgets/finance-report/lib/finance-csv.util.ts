import type { BXUser } from '@workspace/bx';
import type { RTableProps } from '@workspace/april-ui';
import { companyColorLabel } from '@/modules/shared';
import {
    financeEmployeeName,
    type FinanceClosedReport,
    type FinanceHotReport,
} from '@/modules/entities/finance';

/** Сводка по сотрудникам → RTableProps для exportTableToCSV. */
export const financeClosedCsvData = (
    report: FinanceClosedReport,
    departmentItems: BXUser[],
): RTableProps => ({
    code: 'finance-closed',
    firstCellName: 'Менеджер',
    data: report.employees.map(employee => ({
        id: employee.assignedId,
        name: financeEmployeeName(departmentItems, employee.assignedId),
        actions: [
            { name: 'Сделок', value: employee.dealsCount },
            { name: 'Аванс', value: Math.round(employee.advanceAmount) },
            { name: 'Месячная', value: Math.round(employee.monthlyAmount) },
            { name: 'Оплачено месяцев', value: employee.paidMonths },
            {
                name: 'Ожидаемая',
                value: Math.round(employee.expectedContractAmount),
            },
        ],
    })),
});

/** Горячие клиенты → RTableProps (по сделкам; стадия/менеджер — в имени). */
export const financeHotCsvData = (
    report: FinanceHotReport,
    departmentItems: BXUser[],
): RTableProps => ({
    code: 'finance-hot',
    firstCellName: 'Сделка',
    data: report.deals.map(deal => ({
        id: deal.id,
        name: [
            deal.companyName || deal.title,
            `— ${deal.stageName}`,
            `— перспектива: ${companyColorLabel(deal.companyColor)}`,
            `— ${financeEmployeeName(departmentItems, deal.assignedId)}`,
        ]
            .filter(Boolean)
            .join(' '),
        actions: [
            { name: 'Opportunity', value: Math.round(deal.opportunity) },
            { name: 'Сумма строк', value: Math.round(deal.productRowsAmount) },
            { name: 'Месячная', value: Math.round(deal.monthlyAmount) },
        ],
    })),
});
