import { OrkReportDealsByCompaniesDto, OrkReportDealItemDto } from "@workspace/nest-api";

// Основные типы для таймлайна
export type MonthRange = { year: number; months: string[] };
export type PeriodRange = { startYear: number; endYear: number; months: string[] };
export type TimelineMode = 'detailed' | 'average' | 'total';

// Интерфейсы для ежемесячных платежей
export interface MonthlyPayment {
    month: number;
    amount: number;
    deal: OrkReportDealItemDto;
}

// Интерфейсы для статистики компании
export interface CompanyStats {
    currentTotal: number;
    averageMonthly: number;
    periodTotal: number;
    dealCount: number;
    successRate: number;
    indexGrowth: number; // Индексация роста
}

// Интерфейсы для фильтров
export interface PeriodFilter {
    startDate: string; // ISO string для Redux сериализации
    endDate: string; // ISO string для Redux сериализации
    clientStatus: 'all' | 'active' | 'inactive';
    indexStatus: 'all' | 'growing' | 'declining' | 'stable';
    assignedUsers: string[]; // Массив ID пользователей
}

// Интерфейсы для матрицы по годам
export interface YearlyData {
    year: number;
    monthlyTotals: number[];
}

// Интерфейсы для индексации
export interface ImplementationIndex {
    companyId: number;
    companyName: string;
    deals: Array<{
        date: string;
        sum: number;
        index: number; // процент изменения от предыдущей сделки
        realization: number; // 1 для успешных, 0 для отказов
    }>;
    avgIndex: number;
    realizationRate: number; // процент успешных сделок
}

// Интерфейсы для месячных данных индексации
export interface MonthlyIndexData {
    month: string;
    avgIndex: number;
    totalDeals: number;
    successfulDeals: number;
    realizationRevenue: number; // выручка от успешных сделок в рублях
    avgDealSum: number;
}

// Интерфейсы для тепловой карты
export interface CompanyHeatmapData {
    company: string;
    periods: Array<{
        period: string;
        index: number;
        realization: number; // выручка от успешных сделок в рублях
        deals: number;
    }>;
}

// Состояние таймлайна
export interface TimelineState {
    periodFilter: PeriodFilter;
    timelineMode: TimelineMode;
    expandedCompanies: number[];
}

// Состояние аналитики
export interface AnalyticsState {
    selectedChartType: 'avgSum' | 'index' | 'realization' | 'combined';
    selectedPeriod: 'monthly' | 'quarterly' | 'yearly';
}
