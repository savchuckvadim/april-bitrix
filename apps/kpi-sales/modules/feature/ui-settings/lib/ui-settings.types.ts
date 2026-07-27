import type { BlockState } from '@/modules/entities/report/lib/localStorage-util';
import type { StoredMergedFilter } from '@/modules/feature/merged-kpi-calling-report/lib/merged-filter-storage.util';
import type { PersistedConversions } from '@/modules/feature/report-conversions';
import type { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import type {
    ComparisonMode,
    FinanceHotThreshold,
} from '@/modules/entities/finance';

/**
 * Единый блоб UI-настроек kpi-sales: localStorage — кэш, бэк
 * (report_settings.other) — источник истины между браузерами.
 * Изоляция строго domain + userId. Тема сюда НЕ входит (browser-only).
 */
export interface UiSettingsBlob {
    version: 1;
    /** ISO-дата сборки блоба — разрешение конфликтов last-write-wins. */
    updatedAt: string;
    /** Настройки конверсий (таблицы/виджет/вкладка). */
    conversions?: PersistedConversions;
    /** Видимость блоков отчёта (ReportBlockWrapper). */
    blocks?: Record<string, BlockState>;
    /** Локальный фильтр объединённого отчёта. */
    mergedFilter?: StoredMergedFilter;
    /** Выбранный тип отчёта (вкладка). */
    reportType?: EReportType;
    /** Выборы в графиках (usePersistedSelection), key → value. */
    chartSelections?: Record<string, string>;
    /** Настройки финансового отчёта. */
    finance?: {
        comparison: ComparisonMode;
        hotThreshold: FinanceHotThreshold;
    };
}
