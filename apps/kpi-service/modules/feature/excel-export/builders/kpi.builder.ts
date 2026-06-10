import React from 'react';
import { OrkReportKpiData, KPIOrk } from '@workspace/nest-api';
import KPIChart from '@/modules/entities/report/ui/charts/KPIChart';
import { ReportCallingData } from '@/modules/entities/calling-statistics/type/calling-type';
import {
    createWorkbook,
    addTitleRow,
    addHeaderRow,
    addTotalRow,
    addMultiMetricRatingSheet,
    MetricRating,
    autoWidth,
    embedPng,
    downloadWorkbook,
} from '../lib/workbook';
import { addFiltersSheet, FilterLine } from '../lib/filters-sheet';
import { captureCharts } from '../lib/capture-charts';

export interface KpiWorkbookArgs {
    report: OrkReportKpiData[];
    date: { from: string; to: string };
    callings: ReportCallingData[];
    /** Имена выбранных действий (для листа «Фильтры») */
    selectedActionNames: string[];
}

const formatDate = (value: string): string => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('ru-RU');
};

const userTotal = (item: OrkReportKpiData): number =>
    item.kpi.reduce((sum, k) => sum + (k.count ?? 0), 0);

export async function buildKpiWorkbook(args: KpiWorkbookArgs): Promise<void> {
    const { report, date, callings, selectedActionNames } = args;
    const wb = createWorkbook();

    // Колонки действий берём из первого сотрудника (как на бэкенде)
    const actionColumns: { name: string; innerCode: string }[] =
        (report[0]?.kpi ?? []).map((k: KPIOrk) => ({
            name: k.action.name ?? k.action.innerCode ?? '',
            innerCode: k.action.innerCode ?? '',
        }));

    // ===== Лист «KPI» =====
    const kpiWs = wb.addWorksheet('KPI');
    addTitleRow(
        kpiWs,
        `Период: ${formatDate(date.from)} – ${formatDate(date.to)}`,
        actionColumns.length + 1,
    );
    kpiWs.addRow([]);
    addHeaderRow(kpiWs, ['ФИО', ...actionColumns.map(c => c.name)]);

    report.forEach(item => {
        const values = actionColumns.map(col => {
            const kpi = item.kpi.find(k => k.action.innerCode === col.innerCode);
            return kpi?.count ?? 0;
        });
        const row = kpiWs.addRow([item.userName, ...values]);
        row.getCell(1).font = { bold: true };
    });

    // Итого и Среднее по каждому действию
    const totals = actionColumns.map(col =>
        report.reduce((sum, item) => {
            const kpi = item.kpi.find(k => k.action.innerCode === col.innerCode);
            return sum + (kpi?.count ?? 0);
        }, 0),
    );
    addTotalRow(kpiWs, 'Итого', totals);
    if (report.length > 0) {
        addTotalRow(
            kpiWs,
            'Среднее',
            totals.map(t => Math.round(t / report.length)),
        );
    }
    autoWidth(kpiWs);

    // ===== Лист «Рейтинги» (если сотрудников несколько) =====
    // Рейтинг по каждому показателю (действию) из фильтра + общий «Всего действий»
    if (report.length > 1) {
        const metrics: MetricRating[] = [
            {
                label: 'Всего действий',
                rows: report.map(item => ({
                    name: item.userName,
                    value: userTotal(item),
                })),
            },
            ...actionColumns.map(col => ({
                label: col.name,
                rows: report.map(item => {
                    const kpi = item.kpi.find(
                        k => k.action.innerCode === col.innerCode,
                    );
                    return { name: item.userName, value: kpi?.count ?? 0 };
                }),
            })),
        ];
        addMultiMetricRatingSheet(wb, 'Рейтинги', metrics);
    }

    // ===== Лист «Статистика звонков» =====
    if (callings.length > 0) {
        const callWs = wb.addWorksheet('Статистика звонков');
        const callColumns = callings[0]?.callings.map(c => c.action) ?? [];
        addHeaderRow(callWs, ['Менеджер', ...callColumns]);
        callings.forEach(item => {
            const values = item.callings.map(c => c.count ?? 0);
            const row = callWs.addRow([item.userName ?? 'Менеджер', ...values]);
            row.getCell(1).font = { bold: true };
        });
        autoWidth(callWs);
    }

    // ===== Лист «Графики» =====
    const charts = await captureCharts([
        {
            title: 'KPI отдела Сервиса',
            node: React.createElement(KPIChart, { report }),
            width: 1000,
            height: 420,
        },
    ]);
    // if (charts.length > 0) {
    //     const chartWs = wb.addWorksheet('Графики');
    //     let anchorRow = 0;
    //     charts.forEach(chart => {
    //         addTitleRow(chartWs, chart.title, 6);
    //         embedPng(wb, chartWs, chart.pngDataUrl, {
    //             col: 0,
    //             row: anchorRow + 1,
    //             width: chart.width,
    //             height: chart.height,
    //         });
    //         anchorRow += Math.ceil(chart.height / 20) + 3;
    //         for (let i = 0; i < Math.ceil(chart.height / 20); i++) {
    //             chartWs.addRow([]);
    //         }
    //     });
    // }

    // ===== Лист «Фильтры» =====
    // const filterLines: FilterLine[] = [
    //     { label: 'Период', value: `${formatDate(date.from)} – ${formatDate(date.to)}` },
    //     { label: 'Сотрудников в отчёте', value: String(report.length) },
    //     {
    //         label: 'Действий',
    //         value: selectedActionNames.length
    //             ? selectedActionNames.join(', ')
    //             : 'все',
    //     },
    // ];
    // addFiltersSheet(wb, filterLines);

    await downloadWorkbook(wb, 'kpi-report.xlsx');
}
