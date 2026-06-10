import React from 'react';
import { OrkReportDealsByCompaniesDto } from '@workspace/nest-api';
import { PeriodFilter } from '@/modules/feature/deals-report-calculation/TimeLineTable/model/types';
import {
    calculateCompanyStats,
    calculateYearlyMatrix,
    getYearsInPeriod,
    getMonthlyLabels,
    getDealDuration,
} from '@/modules/feature/deals-report-calculation/TimeLineTable/lib/utils/timeline.utils';
import { ImplementationAnalytics } from '@/modules/feature/deals-report-calculation/TimeLineTable/components/ImplementationAnalytics';
import {
    createWorkbook,
    addTitleRow,
    addHeaderRow,
    addTotalRow,
    addRatingSheet,
    autoWidth,
    embedPng,
    downloadWorkbook,
} from '../lib/workbook';
import { addFiltersSheet, FilterLine } from '../lib/filters-sheet';
import { captureCharts } from '../lib/capture-charts';

export interface FinancialWorkbookArgs {
    filteredCompanies: OrkReportDealsByCompaniesDto[];
    periodFilter: PeriodFilter;
}

const round = (n: number): number => Math.round(Number.isFinite(n) ? n : 0);

const dealStatus = (deal: { isWon: boolean; isLost: boolean }): string =>
    deal.isWon ? 'Успешная' : deal.isLost ? 'Отказ' : 'В процессе';

export async function buildFinancialWorkbook(
    args: FinancialWorkbookArgs,
): Promise<void> {
    const { filteredCompanies, periodFilter } = args;
    const start = new Date(periodFilter.startDate);
    const end = new Date(periodFilter.endDate);
    const assignedUsers = periodFilter.assignedUsers;
    const years = getYearsInPeriod(start, end);
    const monthLabels = getMonthlyLabels();

    const wb = createWorkbook();

    const statsByCompany = filteredCompanies.map(c => ({
        company: c.company,
        deals: c.deals,
        stats: calculateCompanyStats(c, start, end, assignedUsers),
    }));

    // ===== Лист «Статистика компаний» =====
    const statsWs = wb.addWorksheet('Статистика компаний');
    addTitleRow(
        statsWs,
        `Период: ${start.getFullYear()} – ${end.getFullYear()}`,
        7,
    );
    statsWs.addRow([]);
    addHeaderRow(statsWs, [
        'Компания',
        'Сделок',
        'Сумма за период, ₽',
        'Средн./мес, ₽',
        'Индексация, %',
        'Успешность, %',
        'Клиент',
    ]);
    statsByCompany.forEach(({ company, stats }) => {
        const row = statsWs.addRow([
            company.title,
            stats.dealCount,
            round(stats.periodTotal),
            round(stats.averageMonthly),
            Number(stats.indexGrowth.toFixed(1)),
            Number(stats.successRate.toFixed(1)),
            company.isActiveClient ? 'Активный' : 'Неактивный',
        ]);
        row.getCell(1).font = { bold: true };
    });
    addTotalRow(statsWs, 'Итого', [
        statsByCompany.reduce((s, x) => s + x.stats.dealCount, 0),
        round(statsByCompany.reduce((s, x) => s + x.stats.periodTotal, 0)),
        '',
        '',
        '',
        '',
    ]);
    autoWidth(statsWs);

    // ===== Лист «Рейтинг компаний» (если несколько) =====
    if (statsByCompany.length > 1) {
        addRatingSheet(
            wb,
            'Рейтинг компаний',
            'Сумма за период, ₽',
            statsByCompany.map(x => ({
                name: x.company.title,
                value: round(x.stats.periodTotal),
            })),
            v => v.toLocaleString('ru-RU'),
        );
    }

    // ===== Лист «Таймлайн (помесячно)» =====
    const timelineWs = wb.addWorksheet('Таймлайн');
    addHeaderRow(timelineWs, [
        'Компания',
        'Год',
        ...monthLabels,
        'Итого за год',
    ]);
    filteredCompanies.forEach(c => {
        const matrix = calculateYearlyMatrix(c, start, end, assignedUsers);
        matrix.forEach(yearData => {
            const yearTotal = yearData.monthlyTotals.reduce(
                (s, v) => s + v,
                0,
            );
            timelineWs.addRow([
                c.company.title,
                yearData.year,
                ...yearData.monthlyTotals.map(round),
                round(yearTotal),
            ]);
        });
    });
    autoWidth(timelineWs);

    // ===== Лист «Сделки (детализация)» =====
    const dealsWs = wb.addWorksheet('Сделки');
    addHeaderRow(dealsWs, [
        'Компания',
        'Сделка',
        'С',
        'По',
        'Длительность, мес',
        'Сумма, ₽',
        'Сумма/мес, ₽',
        'Статус',
        'Ответственный',
    ]);
    filteredCompanies.forEach(c => {
        c.deals.forEach(deal => {
            const duration = deal.duration || getDealDuration(deal);
            const monthSum = deal.monthSum || +deal.sum / (duration || 1);
            dealsWs.addRow([
                c.company.title,
                deal.title || `Сделка #${deal.id}`,
                deal.from ? new Date(deal.from).toLocaleDateString('ru-RU') : '',
                deal.to ? new Date(deal.to).toLocaleDateString('ru-RU') : '',
                duration,
                round(+deal.sum),
                round(monthSum),
                dealStatus(deal),
                deal.assignedById || '',
            ]);
        });
    });
    autoWidth(dealsWs);

    // ===== Лист «Итоги» =====
    const totalsWs = wb.addWorksheet('Итоги');
    addHeaderRow(totalsWs, ['Показатель', 'Значение']);
    const totalRevenue = statsByCompany.reduce(
        (s, x) => s + x.stats.periodTotal,
        0,
    );
    const totalDeals = statsByCompany.reduce(
        (s, x) => s + x.stats.dealCount,
        0,
    );
    const avgIndex =
        statsByCompany.length > 0
            ? statsByCompany.reduce((s, x) => s + x.stats.indexGrowth, 0) /
              statsByCompany.length
            : 0;
    totalsWs.addRow(['Компаний в срезе', filteredCompanies.length]);
    totalsWs.addRow(['Всего сделок', totalDeals]);
    totalsWs.addRow(['Суммарная выручка за период, ₽', round(totalRevenue)]);
    totalsWs.addRow(['Средняя индексация, %', Number(avgIndex.toFixed(1))]);
    autoWidth(totalsWs);

    // ===== Лист «Графики» =====
    const charts = await captureCharts([
        {
            title: 'Аналитика реализации и индексации',
            node: React.createElement(ImplementationAnalytics, {
                companies: filteredCompanies,
                startDate: periodFilter.startDate,
                endDate: periodFilter.endDate,
                assignedUsers,
            }),
            width: 1000,
            height: 2600,
        },
    ]);
    if (charts.length > 0) {
        const chartWs = wb.addWorksheet('Графики');
        let anchorRow = 0;
        charts.forEach(chart => {
            addTitleRow(chartWs, chart.title, 6);
            embedPng(wb, chartWs, chart.pngDataUrl, {
                col: 0,
                row: anchorRow + 1,
                width: chart.width,
                height: chart.height,
            });
            const span = Math.ceil(chart.height / 20);
            anchorRow += span + 3;
            for (let i = 0; i < span; i++) chartWs.addRow([]);
        });
    }

    // ===== Лист «Фильтры» =====
    const filterLines: FilterLine[] = [
        {
            label: 'Период',
            value: `${start.getFullYear()} – ${end.getFullYear()}`,
        },
        {
            label: 'Статус клиента',
            value:
                periodFilter.clientStatus === 'all'
                    ? 'все'
                    : periodFilter.clientStatus === 'active'
                      ? 'активные'
                      : 'неактивные',
        },
        {
            label: 'Индексация',
            value:
                periodFilter.indexStatus === 'all'
                    ? 'все'
                    : periodFilter.indexStatus === 'growing'
                      ? 'растущие'
                      : periodFilter.indexStatus === 'declining'
                        ? 'падающие'
                        : 'стабильные',
        },
        {
            label: 'Выбрано сотрудников',
            value: assignedUsers.length ? String(assignedUsers.length) : 'все',
        },
        { label: 'Компаний в срезе', value: String(filteredCompanies.length) },
    ];
    addFiltersSheet(wb, filterLines);

    await downloadWorkbook(wb, 'financial-report.xlsx');
}
