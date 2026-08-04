import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    getBlockState,
    ReportData,
    ReportDateType,
} from '@/modules/entities/report';
import { setDownloadStatus } from './download-slice';
import { logClient } from '@/modules/app/lib/helper/logClient';
import { sendDownloadingReport } from '@/modules/app/model/AppThunk';
import { getKpidReportsExcelData, getMergedReportsExcelData } from '../../merged-kpi-calling-report/lib/merge-reports.util';
import { DownLoadKpiReportDto } from '@workspace/nest-kpi-report-sales-api';
import {
    EReportType,
    REPORT_TYPE_LABELS,
} from '../../report-widget-type/consts/report-type.consts';
import { checkAccess, EAccessFeature } from '@/modules/shared/access';
import { selectAccessContext } from '@/modules/app/lib/access/use-access';
import { financeEmployeeName } from '@/modules/entities/finance';
import {
    buildPlansExcelPayload,
    buildUserAchievementCells,
    enabledIndicators,
    PLANS_BLOCK_ID,
    rowsWithAnyPlan,
    type PlanFactSources,
} from '../../plans';
import { DownloadHelper } from '../lib/api/download-helper';
import { buildReportStructure } from '../lib/build-report-structure.util';
import { buildFinanceExcelPayload } from '../lib/finance-excel.util';
import { buildConversionResult } from '../../report-conversions/lib/conversion-calc.util';
import { getDatasetForScope } from '../../report-conversions/lib/conversion-dataset.util';
import {
    buildConversionsExcelDto,
    buildConversionsExcelSections,
    buildConversionSectionSources,
} from '../../report-conversions/lib/conversion-excel.util';
import { scopeForReportType } from '../../report-conversions/lib/conversion-catalog';

const downloadHelper = new DownloadHelper();

export enum EDownloadType {
    EXCEL = 'excel',
    PDF = 'pdf',
}
interface IGetDownload {
    type: EDownloadType;
    report: IExcelReport[];
    date: {
        [ReportDateType.FROM]: string;
        [ReportDateType.TO]: string;
    };
}
export interface IExcelReport {

    userName: string;
    kpi: {
        id?: string | number;
        action: string;
        count: number;

    }[];
}

export const getDownload =
    (type: EDownloadType, report: ReportData[]) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            const isLoading = getState().download.isDownloading;
            if (isLoading) return;
            dispatch(setDownloadStatus({ status: true, type }));
            if (type === EDownloadType.PDF) {
                // const downloadPDF = () => {
                //
                //     if (typeof window === 'undefined') return;
                //
                //     const element = document.getElementById('report-container');
                //
                //     const html2pdf = require('html2pdf.js');
                //
                //     setTimeout(() => {
                //         html2pdf()
                //             .set({
                //                 margin: 0.5,
                //                 filename: 'kpi-report.pdf',
                //                 image: { type: 'jpeg', quality: 0.98 },
                //                 html2canvas: { scale: 2 },
                //                 jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
                //             })
                //             .from(element)
                //             .download();
                //     }, 1000);
                // }
                // downloadPDF()
            } else {
                const state = getState();
                const { selectedUsers, selectedActions } = state.mergedReport;




                const callingsReport = getState().callingStatistics.items;


                const mergedReport = callingsReport && getMergedReportsExcelData(report, callingsReport, selectedUsers, selectedActions);
                const kpiReport = getKpidReportsExcelData(report);
                const widgetStyle = state.reportType.current;
                const isMerged = widgetStyle === EReportType.MERGED;

                // ЗЕРКАЛО UI: вкладка «Финансы» показывает только финансовые
                // блоки — Excel состоит из их листов (без kpi/конверсий/планов).
                if (widgetStyle === EReportType.FINANCE) {
                    const financeData = {
                        report: [],
                        type,
                        date: state.report.date,
                        finance: buildFinanceExcelPayload(state),
                    } as DownLoadKpiReportDto;
                    const financeBlob =
                        await downloadHelper.downloadExcel(financeData);
                    if (financeBlob instanceof Blob) {
                        const url = window.URL.createObjectURL(financeBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'report.xlsx');
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                    }
                    dispatch(setDownloadStatus({ status: false, type }));
                    dispatch(sendDownloadingReport());
                    return;
                }

                const reportRows = (isMerged ? mergedReport : kpiReport) ?? [];
                // Разбивка по отделам/группам для листов excel (моно/мульти).
                const structure = buildReportStructure(
                    state.department.departments,
                    state.department.isMulti,
                    new Set(reportRows.map(row => Number(row.id))),
                );

                const date = state.report.date;

                // Лист «Конверсии»: и конфиг, и ДАТАСЕТ по одному scope
                // (видимого блока вкладки) — раньше датасет строился
                // isMerged?'merged':'kpi', рассинхронясь с конфигом на «Звонках».
                //
                // ЗЕРКАЛО UI: на вкладке «Все» блок конверсий не рендерится —
                // листа нет; скрыт тумблером блока — листа тоже нет.
                const conversionScope = scopeForReportType(widgetStyle);
                const conversionsBlockVisible =
                    widgetStyle !== EReportType.All &&
                    getBlockState(`conversions-widget-${conversionScope}`)
                        .isVisible;
                const tabConfig = state.conversions.widget[conversionScope];
                const conversionsDataset = getDatasetForScope(
                    conversionScope,
                    report,
                    callingsReport ?? [],
                    conversionScope === 'merged'
                        ? { selectedUsers, selectedActions }
                        : undefined,
                );
                const conversionsResult = buildConversionResult(
                    conversionsDataset,
                    tabConfig.codes,
                    tabConfig.method,
                );
                // Разбивка листа по отделам/группам — как на KPI-листах
                const conversionSections = buildConversionsExcelSections(
                    conversionsDataset,
                    tabConfig.codes,
                    tabConfig.method,
                    buildConversionSectionSources(
                        state.department.departments,
                        state.department.isMulti,
                    ),
                );
                const conversions =
                    conversionsBlockVisible && conversionsResult.stepDefs.length
                        ? buildConversionsExcelDto(
                              conversionsResult,
                              tabConfig.method,
                              conversionSections,
                              REPORT_TYPE_LABELS[widgetStyle],
                          )
                        : undefined;

                // ПЛАНЫ (зеркало UI): только при доступе PLANS_VIEW, настроенных
                // показателях и видимом блоке «Планы» (его тумблер = настройка
                // «показать/скрыть» рядового); рядовой — только своя строка.
                const accessCtx = selectAccessContext(state);
                const plansVisible =
                    checkAccess(EAccessFeature.PLANS_VIEW, accessCtx) &&
                    getBlockState(PLANS_BLOCK_ID).isVisible;
                const planIndicators = enabledIndicators(
                    state.plans.catalog,
                    state.plans.indicators,
                );
                let plans: DownLoadKpiReportDto['plans'];
                if (plansVisible && planIndicators.length) {
                    const canViewAll = checkAccess(
                        EAccessFeature.PLANS_VIEW_ALL,
                        accessCtx,
                    );
                    const currentUserId = Number(
                        state.department.currentUser?.userId ?? 0,
                    );
                    const visibleIds = reportRows.map(row => Number(row.id));
                    const scopedIds = canViewAll
                        ? visibleIds
                        : visibleIds.filter(id => id === currentUserId);
                    const factSources: PlanFactSources = {
                        report,
                        callings: callingsReport ?? [],
                        airtime: state.airtime.team.data,
                        financeEmployees:
                            state.finance.closed.report?.employees ?? [],
                    };
                    // Сотрудники без единого плана в лист «Планы» не попадают.
                    const planRows = rowsWithAnyPlan(
                        scopedIds.map(userId => ({
                            userId,
                            userName: financeEmployeeName(
                                state.department.items,
                                userId,
                            ),
                            cells: buildUserAchievementCells(
                                planIndicators,
                                state.plans.targetsByUser[userId],
                                factSources,
                                userId,
                                date.from,
                                date.to,
                            ),
                        })),
                    );
                    plans = (buildPlansExcelPayload(
                        planIndicators,
                        planRows,
                        buildConversionSectionSources(
                            state.department.departments,
                            state.department.isMulti,
                        ),
                        true,
                    ) ?? undefined) as DownLoadKpiReportDto['plans'];
                }

                const data = {
                    report: reportRows,
                    type,
                    date,
                    structure,
                    conversions,
                    plans,
                } as DownLoadKpiReportDto;






                const blob = await downloadHelper.downloadExcel(data);

                if (blob instanceof Blob) {
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'report.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else {
                    const app = getState().app;
                    const domain = app.domain;
                    const user = `${app.bitrix.user?.ID} ${app.bitrix.user?.NAME} ${app.bitrix.user?.LAST_NAME}`;
                    console.error('❌ Не blob:', blob);
                    logClient(
                        {
                            level: 'error',
                            context: 'download-thunk get download',
                            title: 'download report',
                            message:
                                'Ошибка скачивания отчета getDownload: ❌ Не blob',
                            domain,
                            userId: user,
                        },
                        {
                            blob,
                        },
                    );
                }
            }

            dispatch(setDownloadStatus({ status: false, type }));
            dispatch(sendDownloadingReport());
        };
