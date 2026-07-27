import type { DownLoadKpiReportDto } from '@workspace/nest-kpi-report-sales-api';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { setDownloadStatus } from '@/modules/feature/download/model/download-slice';
import { EDownloadType } from '@/modules/feature/download/model/download-thunk';
import {
    getKpidReportsExcelData,
    getMergedReportsExcelData,
} from '@/modules/feature/merged-kpi-calling-report/lib/merge-reports.util';
import { buildReportStructure } from '@/modules/feature/download/lib/build-report-structure.util';
import { getBlockState } from '@/modules/entities/report';
import { buildConversionResult } from '@/modules/feature/report-conversions/lib/conversion-calc.util';
import { getDatasetForScope } from '@/modules/feature/report-conversions/lib/conversion-dataset.util';
import {
    buildConversionsExcelDto,
    buildConversionsExcelSections,
    buildConversionSectionSources,
} from '@/modules/feature/report-conversions/lib/conversion-excel.util';
import { scopeForReportType } from '@/modules/feature/report-conversions/lib/conversion-catalog';
import {
    EReportType,
    REPORT_TYPE_LABELS,
} from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { buildFinanceExcelPayload } from '@/modules/feature/download/lib/finance-excel.util';

/**
 * Excel на публичной странице: собираем DownLoadKpiReportDto тем же кодом,
 * что и getDownload во фрейме (данные — из гидратированного снимка),
 * но шлём через Next-прокси /api/share/[token]/excel — бэкенд-URL наружу
 * не светится, бэк валидирует токен и рендерит xlsx.
 */
export const getShareDownload =
    (token: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.download.isDownloading) return;
        dispatch(
            setDownloadStatus({ status: true, type: EDownloadType.EXCEL }),
        );

        try {
            // ЗЕРКАЛО UI: вкладка «Финансы» у зрителя — только финанс-листы.
            if (state.reportType.current === EReportType.FINANCE) {
                const financeData = {
                    report: [],
                    type: EDownloadType.EXCEL,
                    date: state.report.date,
                    finance: buildFinanceExcelPayload(state),
                } as unknown as DownLoadKpiReportDto;
                const financeResponse = await fetch(
                    `/api/share/${encodeURIComponent(token)}/excel`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(financeData),
                    },
                );
                if (!financeResponse.ok) {
                    throw new Error(
                        `excel download failed: ${financeResponse.status}`,
                    );
                }
                const financeBlob = await financeResponse.blob();
                const financeUrl = window.URL.createObjectURL(financeBlob);
                const financeLink = document.createElement('a');
                financeLink.href = financeUrl;
                financeLink.setAttribute('download', 'report.xlsx');
                document.body.appendChild(financeLink);
                financeLink.click();
                financeLink.remove();
                window.URL.revokeObjectURL(financeUrl);
                return;
            }

            const report = state.report.report;
            const callingsReport = state.callingStatistics.items;
            const { selectedUsers, selectedActions } = state.mergedReport;
            const isMerged =
                state.reportType.current === EReportType.MERGED;

            const mergedReport =
                callingsReport &&
                getMergedReportsExcelData(
                    report,
                    callingsReport,
                    selectedUsers,
                    selectedActions,
                );
            const kpiReport = getKpidReportsExcelData(report);
            const reportRows = (isMerged ? mergedReport : kpiReport) ?? [];

            const structure = buildReportStructure(
                state.department.departments,
                state.department.isMulti,
                new Set(reportRows.map(row => Number(row.id))),
            );

            // Конфиг и датасет по одному scope видимого блока — как в
            // download-thunk фрейма (без рассинхрона на «Звонках»).
            // ЗЕРКАЛО UI: на вкладке «Все» блока конверсий нет — листа нет;
            // скрыт тумблером у зрителя — тоже нет.
            const conversionScope = scopeForReportType(
                state.reportType.current,
            );
            const conversionsBlockVisible =
                state.reportType.current !== EReportType.All &&
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
            // Разбивка по отделам/группам — как в download-thunk фрейма
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
                          REPORT_TYPE_LABELS[state.reportType.current],
                      )
                    : undefined;

            const data = {
                report: reportRows,
                type: EDownloadType.EXCEL,
                date: state.report.date,
                structure,
                conversions,
            } as unknown as DownLoadKpiReportDto;

            const response = await fetch(
                `/api/share/${encodeURIComponent(token)}/excel`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                },
            );
            if (!response.ok) {
                throw new Error(`excel download failed: ${response.status}`);
            }
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('share excel download error:', error);
        } finally {
            dispatch(
                setDownloadStatus({
                    status: false,
                    type: EDownloadType.EXCEL,
                }),
            );
        }
    };
