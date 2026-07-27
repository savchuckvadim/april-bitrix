import type {
    ClosedSalesDealDto,
    ClosedSalesEmployeeDto,
    ClosedSalesReportDto,
    ClosedSalesTotalsDto,
    HotClientDealDto,
    HotClientsReportDto,
    HotClientsRequestDtoThreshold,
    HotClientsTotalsDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Доменные алиасы generated DTO финансовой аналитики. */
export type FinanceClosedDeal = ClosedSalesDealDto;
export type FinanceClosedTotals = ClosedSalesTotalsDto;
export type FinanceClosedEmployee = ClosedSalesEmployeeDto;
export type FinanceClosedReport = ClosedSalesReportDto;

export type FinanceHotDeal = HotClientDealDto;
export type FinanceHotTotals = HotClientsTotalsDto;
export type FinanceHotReport = HotClientsReportDto;

export type FinanceHotThreshold = HotClientsRequestDtoThreshold;

/** Ссылка на сделку в Битриксе. */
export const bitrixDealUrl = (domain: string, dealId: number): string =>
    `https://${domain}/crm/deal/details/${dealId}/`;

/** Ссылка на компанию в Битриксе. */
export const bitrixCompanyUrl = (
    domain: string,
    companyId: number,
): string => `https://${domain}/crm/company/details/${companyId}/`;
