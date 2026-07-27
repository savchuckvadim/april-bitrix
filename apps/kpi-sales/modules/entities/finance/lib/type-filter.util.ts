import type {
    FinanceClosedDeal,
    FinanceClosedEmployee,
    FinanceClosedReport,
    FinanceHotDeal,
} from '../model';
import {
    FINANCE_TYPE_FILTER_ALL,
    type FinanceTypeFilters,
} from '../model/finance-slice';

/** Опция фильтра по типу (значения собираются из данных отчёта). */
export interface FinanceTypeOption {
    code: string;
    name: string;
}

/** Общие поля типов у закрытой и горячей сделки. */
interface DealTypeFields {
    contractTypeCode: string | null;
    contractTypeName: string | null;
    companyClientType: string | null;
}

export const dealMatchesTypeFilters = (
    deal: DealTypeFields,
    filters: FinanceTypeFilters,
): boolean => {
    if (
        filters.contractType !== FINANCE_TYPE_FILTER_ALL &&
        deal.contractTypeCode !== filters.contractType
    ) {
        return false;
    }
    if (
        filters.clientType !== FINANCE_TYPE_FILTER_ALL &&
        deal.companyClientType !== filters.clientType
    ) {
        return false;
    }
    return true;
};

const hasActiveFilter = (filters: FinanceTypeFilters): boolean =>
    filters.contractType !== FINANCE_TYPE_FILTER_ALL ||
    filters.clientType !== FINANCE_TYPE_FILTER_ALL;

/** Итоги сотрудника из его (отфильтрованных) сделок. */
const employeeFromDeals = (
    employee: FinanceClosedEmployee,
    deals: FinanceClosedDeal[],
): FinanceClosedEmployee => ({
    ...employee,
    deals,
    dealsCount: deals.length,
    advanceAmount: deals.reduce((sum, deal) => sum + deal.advanceAmount, 0),
    paidMonths: deals.reduce((sum, deal) => sum + deal.paidMonths, 0),
    monthlyAmount: deals.reduce((sum, deal) => sum + deal.monthlyAmount, 0),
    quantity: deals.reduce((sum, deal) => sum + deal.quantity, 0),
    expectedContractAmount: deals.reduce(
        (sum, deal) => sum + deal.expectedContractAmount,
        0,
    ),
});

/**
 * Отчёт закрытых продаж под клиентскими фильтрами типов: сделки
 * отфильтрованы, итоги сотрудников пересчитаны, сотрудники без сделок
 * скрыты. Без активных фильтров возвращается исходный отчёт (та же
 * ссылка — мемоизация потребителей не ломается).
 */
export const filterClosedReportByTypes = (
    report: FinanceClosedReport,
    filters: FinanceTypeFilters,
): FinanceClosedReport => {
    if (!hasActiveFilter(filters)) return report;
    const employees = report.employees.flatMap(employee => {
        const deals = employee.deals.filter(deal =>
            dealMatchesTypeFilters(deal, filters),
        );
        return deals.length ? [employeeFromDeals(employee, deals)] : [];
    });
    return { ...report, employees };
};

/** Горячие сделки под клиентскими фильтрами типов. */
export const filterHotDealsByTypes = (
    deals: FinanceHotDeal[],
    filters: FinanceTypeFilters,
): FinanceHotDeal[] =>
    hasActiveFilter(filters)
        ? deals.filter(deal => dealMatchesTypeFilters(deal, filters))
        : deals;

/**
 * Каталог значений для селектов фильтра — из самих данных отчётов
 * (закрытые + горячие): фильтровать можно только по тому, что реально
 * встречается. resolveClientTypeName — имя кода из pbx-меты (fallback код).
 */
export const collectTypeFilterOptions = (
    closedDeals: FinanceClosedDeal[],
    hotDeals: FinanceHotDeal[],
    resolveClientTypeName: (code: string) => string,
): { contractTypes: FinanceTypeOption[]; clientTypes: FinanceTypeOption[] } => {
    const contractTypes = new Map<string, string>();
    const clientTypes = new Map<string, string>();
    for (const deal of [...closedDeals, ...hotDeals]) {
        if (deal.contractTypeCode) {
            contractTypes.set(
                deal.contractTypeCode,
                deal.contractTypeName || deal.contractTypeCode,
            );
        }
        if (deal.companyClientType) {
            clientTypes.set(
                deal.companyClientType,
                resolveClientTypeName(deal.companyClientType),
            );
        }
    }
    const toOptions = (map: Map<string, string>): FinanceTypeOption[] =>
        [...map.entries()]
            .map(([code, name]) => ({ code, name }))
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return {
        contractTypes: toOptions(contractTypes),
        clientTypes: toOptions(clientTypes),
    };
};
