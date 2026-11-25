import type { RTableAction, RTableRow } from '@workspace/april-ui';
import type { ReportCallingData } from "@/modules/entities/calling-statistics";
import type { ReportData } from "@/modules/entities/report/model/types/report/report-type";
import type { RTableProps } from "@/modules/shared";
import type { DownloadKpiReportItemDto, DownloadReportKpiItemDto } from "@workspace/nest-kpi-report-sales-api";
import {
    isMergedSelected,
    mergeRowsByUser,
    type MergedRowAdapter,
} from "./merge-core.util";

/** Строки таблицы экрана: показатели — RTableAction, ключ колонки — название. */
const TABLE_ROW_ADAPTER: MergedRowAdapter<RTableRow, RTableAction> = {
    idOf: row => row.id,
    cellsOf: row => row.actions,
    nameOf: action => action.name,
    zeroOf: ({ name, code }) =>
        code === undefined ? { name, value: 0 } : { name, code, value: 0 },
};

/** Строки Excel для сервера: показатели — DownloadReportKpiItemDto, ключ колонки — action. */
const EXCEL_ROW_ADAPTER: MergedRowAdapter<DownloadKpiReportItemDto, DownloadReportKpiItemDto> = {
    idOf: row => row.id,
    cellsOf: row => row.kpi,
    nameOf: kpi => kpi.action,
    zeroOf: ({ id, action }) => ({ id, action, count: 0 }),
};

/**
 * Объединённая таблица: сотрудники из обоих источников (сначала в порядке
 * звонков, затем те, кто есть только в событиях), у всех строк одинаковые
 * колонки — показатели звонков, затем показатели событий; отсутствующее
 * значение — ноль. Исходные таблицы не изменяются.
 */
export const getMergedReportsData = (report: RTableProps, callingsReport: RTableProps): RTableProps => {
    const data = mergeRowsByUser(callingsReport.data, report.data, TABLE_ROW_ADAPTER, 'calling')
        .map(({ row, cells }) => ({ ...row, actions: cells }));

    return {
        code: report.code,
        firstCellName: report.firstCellName,
        data,
    };
}


export const getKpidReportsExcelData = (reportData: ReportData[],): DownloadKpiReportItemDto[] => {
    const result: DownloadKpiReportItemDto[] = reportData.map(userKpiReport => (
        getDownloadReportFromKpiReport(userKpiReport)
    ));

    return result;
}

/**
 * Excel объединённого отчёта: тот же состав сотрудников и колонок, что у
 * getMergedReportsData, затем выбор сотрудников и показателей (пустой — без
 * ограничения, как на экране). В строке сначала показатели звонков, потом
 * события; шапка (id, имя) — из событий, если сотрудник есть в них.
 */
export const getMergedReportsExcelData = (reportData: ReportData[], callingsReportData: ReportCallingData[], selectedUsers: number[], selectedActions: string[]): DownloadKpiReportItemDto[] => {
    return mergeRowsByUser(
        callingsReportData.map(getDownloadReportFromCallingReport),
        reportData.map(getDownloadReportFromKpiReport),
        EXCEL_ROW_ADAPTER,
        'kpi',
    )
        .filter(({ row }) => isMergedSelected(selectedUsers, row.id))
        .map(({ row, cells }) => ({
            ...row,
            kpi: cells.filter(kpi => isMergedSelected(selectedActions, kpi.action)),
        }));
}


const getDownloadReportFromKpiReport = (kpiReport: ReportData): DownloadKpiReportItemDto => {
    return {
        id: Number(kpiReport.id),
        userName: kpiReport.userName || '',
        kpi: kpiReport.kpi.map(kpi => {
            return {
                id: String(kpi.id),
                action: kpi.action.name,
                count: kpi.count || 0,
            } as DownloadReportKpiItemDto;
        }),
    } as DownloadKpiReportItemDto;
}

const getDownloadReportFromCallingReport = (callingReport: ReportCallingData): DownloadKpiReportItemDto => {
    return {
        id: Number(callingReport.user?.ID ?? callingReport.userId),
        userName: callingReport.userName || '',
        kpi: callingReport.callings.map(calling => {
            return {
                id: String(calling.id),
                action: calling.action as string,
                count: calling.count || 0,
            } as DownloadReportKpiItemDto;
        }),
    } as DownloadKpiReportItemDto;
}


