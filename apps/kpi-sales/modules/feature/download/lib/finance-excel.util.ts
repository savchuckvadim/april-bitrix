import { format } from 'date-fns';
import {
    computeHotTotals,
    filterClosedReportByTypes,
    filterHotDealsByTypes,
    financeEmployeeName,
    hotThresholdLabel,
    type FinanceClosedDeal,
    type FinanceClosedEmployee,
    type FinanceClosedReport,
    type FinanceClosedTotals,
    type FinanceHotDeal,
} from '@/modules/entities/finance';
import { getBlockState } from '@/modules/entities/report';
import { PBX_FIELD_CODES } from '@/modules/feature/pbx-fields';
import type { RootState } from '@/modules/app/model/store';
import {
    buildConversionSectionSources,
    type ConversionExcelSectionSource,
} from '../../report-conversions/lib/conversion-excel.util';
import type { BXUser } from '@workspace/bx';
import type {
    FinanceExcelDealRowDto,
    FinanceExcelDto,
    FinanceExcelEmployeeRowDto,
    FinanceExcelSectionDto,
    FinanceExcelTotalsDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Доменные алиасы generated finance-веток DownLoadKpiReportDto. */
export type FinanceExcelPayload = FinanceExcelDto;
type FinanceExcelTotalsPayload = FinanceExcelTotalsDto;
type FinanceExcelEmployeeRowPayload = FinanceExcelEmployeeRowDto;
type FinanceExcelSectionPayload = FinanceExcelSectionDto;
type FinanceExcelDealRowPayload = FinanceExcelDealRowDto;

const EXCEL_DATE_FORMAT = 'dd.MM.yyyy';

const excelDate = (iso: string | null): string | null =>
    iso ? format(new Date(iso), EXCEL_DATE_FORMAT) : null;

const closedTotalsPayload = (
    totals: FinanceClosedTotals,
): FinanceExcelTotalsPayload => ({
    dealsCount: totals.dealsCount,
    advanceAmount: totals.advanceAmount,
    paidMonths: totals.paidMonths,
    monthlyAmount: totals.monthlyAmount,
    quantity: totals.quantity,
    expectedContractAmount: totals.expectedContractAmount,
});

const employeeTotalsPayload = (
    employee: FinanceClosedEmployee,
): FinanceExcelTotalsPayload => ({
    dealsCount: employee.dealsCount,
    advanceAmount: employee.advanceAmount,
    paidMonths: employee.paidMonths,
    monthlyAmount: employee.monthlyAmount,
    quantity: employee.quantity,
    expectedContractAmount: employee.expectedContractAmount,
});

const closedDealPayload = (
    deal: FinanceClosedDeal,
    employeeName: string,
    clientTypeName: (code: string | null) => string | null,
): FinanceExcelDealRowPayload => ({
    employeeName,
    title: deal.title,
    statusLabel: excelDate(deal.closeDate) ?? '',
    companyName: deal.companyName,
    clientTypeName: clientTypeName(deal.companyClientType),
    contractTypeName: deal.contractTypeName,
    contractStart: excelDate(deal.contractStart),
    contractEnd: excelDate(deal.contractEnd),
    monthlyAmount: deal.monthlyAmount,
    advanceAmount: deal.advanceAmount,
    paidMonths: deal.paidMonths,
    quantity: deal.quantity,
    expectedContractAmount: deal.expectedContractAmount,
});

const hotDealPayload = (
    deal: FinanceHotDeal,
    employeeName: string,
    clientTypeName: (code: string | null) => string | null,
): FinanceExcelDealRowPayload => ({
    employeeName,
    title: deal.title,
    statusLabel: deal.stageName,
    companyName: deal.companyName,
    clientTypeName: clientTypeName(deal.companyClientType),
    contractTypeName: deal.contractTypeName,
    contractStart: excelDate(deal.contractStart),
    contractEnd: excelDate(deal.contractEnd),
    monthlyAmount: deal.monthlyAmount,
    advanceAmount: deal.productRowsAmount,
    paidMonths: deal.paidMonths,
    quantity: deal.quantity,
    expectedContractAmount: deal.opportunity,
});

/**
 * Блок «Продажи» для Excel из (уже отфильтрованного типами) отчёта:
 * свод по сотрудникам, секции отделов/групп, детализация сделок.
 */
export const buildFinanceClosedPayload = (
    report: FinanceClosedReport,
    departmentItems: BXUser[],
    sectionSources: ConversionExcelSectionSource[],
    clientTypeName: (code: string | null) => string | null,
): NonNullable<FinanceExcelPayload['closed']> => {
    const employeeName = (assignedId: number): string =>
        financeEmployeeName(departmentItems, assignedId);

    const rowOf = (
        employee: FinanceClosedEmployee,
    ): FinanceExcelEmployeeRowPayload => ({
        name: employeeName(employee.assignedId),
        totals: employeeTotalsPayload(employee),
    });

    const sections = sectionSources
        .map(section => {
            const ids = new Set(section.userIds);
            const employees = report.employees.filter(employee =>
                ids.has(employee.assignedId),
            );
            if (!employees.length) return null;
            return {
                title: section.title,
                rows: employees.map(rowOf),
                total: closedTotalsPayload({
                    dealsCount: employees.reduce((s, e) => s + e.dealsCount, 0),
                    advanceAmount: employees.reduce(
                        (s, e) => s + e.advanceAmount,
                        0,
                    ),
                    paidMonths: employees.reduce((s, e) => s + e.paidMonths, 0),
                    monthlyAmount: employees.reduce(
                        (s, e) => s + e.monthlyAmount,
                        0,
                    ),
                    quantity: employees.reduce((s, e) => s + e.quantity, 0),
                    expectedContractAmount: employees.reduce(
                        (s, e) => s + e.expectedContractAmount,
                        0,
                    ),
                }),
            };
        })
        .filter((section): section is FinanceExcelSectionPayload => !!section);

    return {
        totals: closedTotalsPayload(report.totals),
        rows: report.employees.map(rowOf),
        sections: sections.length ? sections : undefined,
        deals: report.employees.flatMap(employee =>
            employee.deals.map(deal =>
                closedDealPayload(
                    deal,
                    employeeName(employee.assignedId),
                    clientTypeName,
                ),
            ),
        ),
    };
};

/**
 * Финансовая часть Excel из стора (ЗЕРКАЛО вкладки «Финансы»): каждый блок
 * попадает в файл только когда он видим (тумблер) и данные загружены;
 * действуют те же фильтры типов, что и в UI. Пустой объект → undefined
 * (бэк не создаст ни одного финанс-листа).
 */
export const buildFinanceExcelPayload = (
    state: RootState,
): FinanceExcelPayload | undefined => {
    const clientTypeItems =
        state.pbxFields.meta.byCode[PBX_FIELD_CODES.opClientType]?.items ?? [];
    const clientTypeName = (code: string | null): string | null =>
        code
            ? (clientTypeItems.find(item => item.code === code)?.name ?? code)
            : null;
    const typeFilters = state.finance.typeFilters;
    const finance: FinanceExcelPayload = {};

    const closedReport = state.finance.closed.report;
    if (closedReport && getBlockState('finance-closed').isVisible) {
        finance.closed = buildFinanceClosedPayload(
            filterClosedReportByTypes(closedReport, typeFilters),
            state.department.items,
            buildConversionSectionSources(
                state.department.departments,
                state.department.isMulti,
            ),
            clientTypeName,
        );
    }

    const hotReport = state.finance.hot.report;
    if (hotReport && getBlockState('finance-hot-clients').isVisible) {
        finance.hot = buildFinanceHotPayload(
            filterHotDealsByTypes(hotReport.deals, typeFilters),
            hotThresholdLabel(state.finance.hot.threshold),
            state.department.items,
            clientTypeName,
        );
    }

    return finance.closed || finance.hot ? finance : undefined;
};

/** Блок «Горячие клиенты» для Excel из (отфильтрованных) сделок. */
export const buildFinanceHotPayload = (
    deals: FinanceHotDeal[],
    thresholdLabel: string,
    departmentItems: BXUser[],
    clientTypeName: (code: string | null) => string | null,
): NonNullable<FinanceExcelPayload['hot']> => {
    const totals = computeHotTotals(deals);
    return {
        thresholdLabel,
        totals: {
            dealsCount: totals.dealsCount,
            advanceAmount: totals.productRowsAmountTotal,
            paidMonths: totals.paidMonthsTotal,
            monthlyAmount: totals.monthlyAmountTotal,
            quantity: totals.quantityTotal,
            expectedContractAmount: totals.opportunityTotal,
        },
        deals: deals.map(deal =>
            hotDealPayload(
                deal,
                financeEmployeeName(departmentItems, deal.assignedId),
                clientTypeName,
            ),
        ),
    };
};
