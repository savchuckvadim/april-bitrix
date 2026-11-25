import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import type { ReportFlowKind } from '../model/report-queue.util';

/**
 * Какие тяжёлые данные нужны вкладке отчёта.
 *
 * events / callings — вкладка читает события (`POST /api/kpi-report/get`)
 * и статистику звонков (`POST /api/kpi-report/calling-statistic`);
 * blocking — источник, без которого вкладке показать нечего: пока он не
 * пришёл, страницу держит заставка. null — страницу не блокирует ничто.
 */
export interface ReportDataNeeds {
    readonly events: boolean;
    readonly callings: boolean;
    readonly blocking: ReportFlowKind | null;
}

/** Вкладка со своими запросами: события и звонки отчёта ей не нужны. */
const NOTHING: ReportDataNeeds = {
    events: false,
    callings: false,
    blocking: null,
};

/**
 * Вкладке отчёта нужны ОБА источника, даже если её главный блок читает один:
 * на каждой вкладке отчёта стоят «Планы» и «Конверсии», а планы читают и
 * события, и звонки (feature/plans/hooks/use-plan-achievement.ts), конверсии
 * объединённого отчёта — тоже оба (feature/report-conversions/hooks/
 * use-conversions.hook.ts). Поэтому различается только то, что блокирует
 * страницу: у «Звонков» — статистика звонков, у остальных — события.
 */
const eventsPage: ReportDataNeeds = {
    events: true,
    callings: true,
    blocking: 'report',
};
const callingsPage: ReportDataNeeds = {
    events: true,
    callings: true,
    blocking: 'calling',
};

/**
 * Карта нужд по вкладкам. Record по всему EReportType: новая вкладка не
 * соберётся, пока её нужды не описаны здесь.
 *
 * «Дайджест», «Финансы» и «AI аналитика» читают свои запросы (дайджест дня,
 * финансы, AI-секции) и событий/звонков отчёта не показывают.
 */
export const REPORT_DATA_NEEDS: Readonly<Record<EReportType, ReportDataNeeds>> = {
    [EReportType.All]: eventsPage,
    [EReportType.EVENTS]: eventsPage,
    [EReportType.MERGED]: eventsPage,
    [EReportType.CALLINGS]: callingsPage,
    [EReportType.DIGEST]: NOTHING,
    [EReportType.FINANCE]: NOTHING,
    [EReportType.AI]: NOTHING,
};

/** Нужды вкладки: что запрашивать и что блокирует страницу. */
export const getReportDataNeeds = (type: EReportType): ReportDataNeeds =>
    REPORT_DATA_NEEDS[type];
