import React from 'react';
import { IUserReportItem } from '@/modules/entities/user-report/type/user-report.type';
import { KPICall } from '@/modules/entities/calling-statistics/type/calling-type';
import { UserReportChart } from '@/modules/entities/user-report/ui/UserReport/UserReportChart';
import {
    createWorkbook,
    addTitleRow,
    addHeaderRow,
    addTotalRow,
    autoWidth,
    embedPng,
    downloadWorkbook,
} from '../lib/workbook';
import { addFiltersSheet, FilterLine } from '../lib/filters-sheet';
import { captureCharts } from '../lib/capture-charts';

export interface UserReportSelectedFilters {
    action?: string;
    type?: string;
    initiative?: string;
    communication?: string;
}

export interface UserReportWorkbookArgs {
    userName: string;
    userId: number;
    /** Полный отчёт (для графика — он сам фильтрует по selectedFilters, как на экране) */
    allItems: IUserReportItem[];
    /** Текущий отфильтрованный срез (для таблиц/сводок) */
    filteredItems: IUserReportItem[];
    selectedFilters: UserReportSelectedFilters;
    groupByCompany: boolean;
    resolveCompanyName?: (companyId: string | null) => string;
    /** Статистика звонков сотрудника (из store calling-statistics) */
    callings?: KPICall[] | null;
    /** Сводка по сделкам сотрудника (из store отчёта по сделкам, по assignedById) */
    dealsSummary?: {
        companies: number;
        deals: number;
        totalSum: number;
    } | null;
}

interface FlatRow {
    company: string;
    title: string;
    action: string;
    type: string;
    comment: string;
    eventDate: string;
    planDate: string;
    initiative: string;
    tag: string;
    communication: string;
}

// Парсинг "DD.MM.YYYY HH:mm:ss" (как в UserReportChart)
const parseCustomDate = (dateString: string): Date | null => {
    const match = dateString.match(
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
    );
    if (!match) return null;
    const [, day, month, year, hour, minute, second] = match;
    const date = new Date(
        parseInt(year || '0'),
        parseInt(month || '1') - 1,
        parseInt(day || '1'),
        parseInt(hour || '0'),
        parseInt(minute || '0'),
        parseInt(second || '0'),
    );
    return isNaN(date.getTime()) ? null : date;
};

const mapRow = (
    item: IUserReportItem,
    resolve?: (companyId: string | null) => string,
): FlatRow => {
    const companyRaw = item.service_ork_history_ork_crm_company?.value?.value;
    const companyId = companyRaw?.toString().replace(/\D/g, '') || null;
    return {
        company: resolve ? resolve(companyId) : companyId ?? '',
        title: item.title ?? '',
        action: item.service_ork_history_ork_event_action?.value?.name ?? '',
        type: item.service_ork_history_ork_event_type?.value?.name ?? '',
        comment: item.service_ork_history_manager_comment?.value?.value ?? '',
        eventDate: item.service_ork_history_ork_event_date?.value?.value ?? '',
        planDate: item.service_ork_history_ork_plan_date?.value?.value ?? '',
        initiative:
            item.service_ork_history_ork_event_initiative?.value?.name ?? '',
        tag: item.service_ork_evemt_tag?.value?.value ?? '',
        communication:
            item.service_ork_history_event_communication?.value?.name ?? '',
    };
};

// Полное обозначение действия = Событие + Тип события
// («Презентация Запланирована», «Сервисный сигнал Создан» и т.д.)
const actionLabel = (r: FlatRow): string =>
    [r.action, r.type].filter(Boolean).join(' ').trim();

// Разбивка по действиям (Событие+Тип) → количество, отсортировано по убыванию
const actionBreakdown = (rows: FlatRow[]): [string, number][] => {
    const map = new Map<string, number>();
    rows.forEach(r => {
        const label = actionLabel(r);
        if (!label) return;
        map.set(label, (map.get(label) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
};

export async function buildUserReportWorkbook(
    args: UserReportWorkbookArgs,
): Promise<void> {
    const {
        userName,
        userId,
        allItems,
        filteredItems,
        selectedFilters,
        groupByCompany,
        resolveCompanyName,
        callings,
        dealsSummary,
    } = args;

    const wb = createWorkbook();
    const rows = filteredItems.map(item => mapRow(item, resolveCompanyName));

    // ===== Лист «Сводка» =====
    const summaryWs = wb.addWorksheet('Сводка');
    addTitleRow(summaryWs, `Отчёт сотрудника: ${userName} (#${userId})`, 2);
    summaryWs.addRow([]);

    // -- Общее --
    addHeaderRow(summaryWs, ['Показатель', 'Значение']);
    const withComments = rows.filter(r => r.comment).length;
    summaryWs.addRow(['Всего событий (без фильтра)', allItems.length]);
    summaryWs.addRow(['Событий в срезе', filteredItems.length]);
    summaryWs.addRow(['С комментариями', withComments]);

    // -- Разбивка по действиям (Событие + Тип) --
    summaryWs.addRow([]);
    addHeaderRow(summaryWs, ['Действие (Событие + Тип)', 'Кол-во']);
    const breakdown = actionBreakdown(rows);
    breakdown.forEach(([label, count]) => summaryWs.addRow([label, count]));
    addTotalRow(summaryWs, 'Итого', [rows.length]);

    // -- Сделки сотрудника (из отчёта по сделкам, по assignedById) --
    if (dealsSummary) {
        summaryWs.addRow([]);
        addHeaderRow(summaryWs, ['Сделки сотрудника', 'Значение']);
        summaryWs.addRow(['Компаний', dealsSummary.companies]);
        summaryWs.addRow(['Сделок', dealsSummary.deals]);
        summaryWs.addRow([
            'Сумма, ₽',
            Math.round(dealsSummary.totalSum).toLocaleString('ru-RU'),
        ]);
    }

    // -- Звонки сотрудника (из store) --
    if (callings && callings.length > 0) {
        summaryWs.addRow([]);
        addHeaderRow(summaryWs, ['Звонки', 'Кол-во']);
        callings.forEach(call => summaryWs.addRow([call.action, call.count ?? 0]));
    }
    autoWidth(summaryWs);

    // ===== Лист «События» (детализация) =====
    const eventsWs = wb.addWorksheet('События');
    addHeaderRow(eventsWs, [
        'Компания',
        'Событие',
        'Действие',
        'Тип',
        'Комментарий',
        'Дата события',
        'Дата следующей коммуникации',
        'Инициатива',
        'Тег',
        'Коммуникация',
    ]);
    const sortedRows = groupByCompany
        ? [...rows].sort((a, b) => a.company.localeCompare(b.company))
        : rows;
    sortedRows.forEach(r => {
        eventsWs.addRow([
            r.company,
            r.title,
            r.action,
            r.type,
            r.comment,
            r.eventDate,
            r.planDate,
            r.initiative,
            r.tag,
            r.communication,
        ]);
    });
    autoWidth(eventsWs);

    // ===== Лист «По компаниям» (матрица действий, как в общем KPI) =====
    const byCompanyWs = wb.addWorksheet('По компаниям');
    // Колонки — все уникальные действия (Событие + Тип) из среза, в порядке появления
    const actionNames: string[] = [];
    rows.forEach(r => {
        const label = actionLabel(r);
        if (label && !actionNames.includes(label)) {
            actionNames.push(label);
        }
    });
    addHeaderRow(byCompanyWs, ['Компания', ...actionNames, 'Всего']);

    const companyMap = new Map<string, FlatRow[]>();
    rows.forEach(r => {
        const key = r.company || 'Без компании';
        if (!companyMap.has(key)) companyMap.set(key, []);
        companyMap.get(key)?.push(r);
    });

    Array.from(companyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([company, items]) => {
            const counts = actionNames.map(
                label => items.filter(i => actionLabel(i) === label).length,
            );
            const row = byCompanyWs.addRow([company, ...counts, items.length]);
            row.getCell(1).font = { bold: true };
        });

    // Итоговая строка по каждому действию
    const actionTotals = actionNames.map(
        label => rows.filter(r => actionLabel(r) === label).length,
    );
    addTotalRow(byCompanyWs, 'Итого', [...actionTotals, rows.length]);
    autoWidth(byCompanyWs);

    // ===== Лист «Звонки» (статистика сотрудника из store) =====
    if (callings && callings.length > 0) {
        const callsWs = wb.addWorksheet('Звонки');
        addTitleRow(callsWs, `Статистика звонков: ${userName}`, 2);
        callsWs.addRow([]);
        addHeaderRow(callsWs, ['Показатель', 'Количество']);
        callings.forEach(call => {
            callsWs.addRow([call.action, call.count ?? 0]);
        });
        autoWidth(callsWs);
    }

    // ===== Лист «Динамика» (события по месяцам) =====
    const dynamicsWs = wb.addWorksheet('Динамика');
    addHeaderRow(dynamicsWs, ['Месяц', 'Событий']);
    const monthMap = new Map<string, number>();
    rows.forEach(r => {
        const date = parseCustomDate(r.eventDate);
        if (!date) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    });
    Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, count]) => dynamicsWs.addRow([month, count]));
    autoWidth(dynamicsWs);

    // ===== Лист «Графики» =====
    const charts = await captureCharts([
        {
            title: 'События по периодам',
            node: React.createElement(UserReportChart, {
                report: allItems,
                selectedFilters,
                groupByCompany,
            }),
            width: 1000,
            height: 460,
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
    //         const span = Math.ceil(chart.height / 20);
    //         anchorRow += span + 3;
    //         for (let i = 0; i < span; i++) chartWs.addRow([]);
    //     });
    // }

    // ===== Лист «Фильтры» =====
    // const filterLines: FilterLine[] = [
    //     { label: 'Сотрудник', value: `${userName} (#${userId})` },
    //     { label: 'Действие', value: selectedFilters.action || 'все' },
    //     { label: 'Тип', value: selectedFilters.type || 'все' },
    //     { label: 'Инициатива', value: selectedFilters.initiative || 'все' },
    //     { label: 'Коммуникация', value: selectedFilters.communication || 'все' },
    //     { label: 'Группировка по компаниям', value: groupByCompany ? 'да' : 'нет' },
    // ];
    // addFiltersSheet(wb, filterLines);

    await downloadWorkbook(wb, `user-report-${userId}.xlsx`);
}
