import type {
    AiAnalyticsAuditRecommendation,
    AiAnalyticsAuditReport,
    AiAnalyticsAuditReportTotals,
    AiAnalyticsAuditRules,
} from '../model';
import { formatAuditPct } from './audit-format.util';
import type { Tone } from '@workspace/april-ui/tones';

/** Плитка итогов: подпись + значение уже строкой. */
export interface AuditTotalTile {
    key: string;
    title: string;
    value: string;
}

/** Подписи счётчиков `report.totals` в порядке показа. */
const TOTAL_TITLES: readonly {
    key: keyof AiAnalyticsAuditReportTotals;
    title: string;
}[] = [
    { key: 'fetchedTranscriptions', title: 'Загружено строк' },
    { key: 'outsideWindow', title: 'Вне окна' },
    { key: 'calls', title: 'Звонков в окне' },
    { key: 'withManager', title: 'С менеджером' },
    { key: 'analyzed', title: 'С глубоким разбором' },
];

/**
 * Плитки итогов: счётчики окна плюс две доли «достаточных» ячеек — они
 * лежат на верхнем уровне отчёта, но читаются вместе с итогами.
 */
export const buildTotalTiles = (
    report: AiAnalyticsAuditReport,
): AuditTotalTile[] => [
    ...TOTAL_TITLES.map(({ key, title }) => ({
        key,
        title,
        value: String(report.totals[key]),
    })),
    {
        key: 'analyzedInCellsPct',
        title: `Разборов в ячейках с n ≥ ${report.rules.cellMinN}`,
        value: formatAuditPct(report.analyzedInCellsPct),
    },
    {
        key: 'analyzedByManagerMonthPct',
        title: 'То же без разреза по типу',
        value: formatAuditPct(report.analyzedByManagerMonthPct),
    },
];

/** Флаг рекомендации как бэйдж: подпись и тон. */
export interface AuditRecommendationFlag {
    key: keyof Omit<AiAnalyticsAuditRecommendation, 'lines'>;
    label: string;
    tone: Tone;
}

/**
 * Флаги рекомендации → бэйджи. `true` у обоих флагов — сигнал действия
 * (warning), `false` — «оставить как есть» (success).
 */
export const buildRecommendationFlags = (
    recommendation: AiAnalyticsAuditRecommendation,
): AuditRecommendationFlag[] => [
    {
        key: 'lowerThresholds',
        label: recommendation.lowerThresholds
            ? 'Пороги «мало данных» снизить'
            : 'Пороги «мало данных» оставить',
        tone: recommendation.lowerThresholds ? 'warning' : 'success',
    },
    {
        key: 'cheapShortContour',
        label: recommendation.cheapShortContour
            ? 'Нужен дешёвый контур для коротких звонков'
            : 'Отдельный контур для коротких не нужен',
        tone: recommendation.cheapShortContour ? 'warning' : 'success',
    },
];

/** Пороги правила рекомендации — подписи для строки под бэйджами. */
export const describeAuditRules = (rules: AiAnalyticsAuditRules): string[] => [
    `n в ячейке ≥ ${rules.cellMinN}`,
    `доля разборов в таких ячейках ≥ ${rules.cellShareMinPct} %`,
    `короткий звонок < ${rules.shortCallSec} с`,
    `доля коротких ≤ ${rules.shortShareMaxPct} %`,
];
