/** Публичная поверхность аудита данных AI-аналитики ОП. */
export { AiAnalyticsAuditPanel } from './ui';
export {
    useAuditAbout,
    useGoldenSet,
    useLatestAudit,
    useRunAudit,
    useRunGoldenSet,
    useStageHistoryProbe,
} from './lib/hooks';
export type { StageHistoryProbeParams } from './lib/hooks';
export type {
    AiAnalyticsAuditAbout,
    AiAnalyticsAuditAboutResponse,
    AiAnalyticsAuditPortalStatus,
    AiAnalyticsAuditReport,
    AiAnalyticsAuditResult,
    AiAnalyticsAuditRun,
    AiAnalyticsAuditSource,
    AiAnalyticsGoldenSetEntry,
    AiAnalyticsGoldenSetResult,
    AiAnalyticsGoldenSetRun,
    AiAnalyticsGoldenSetRunResult,
    AiAnalyticsStageHistoryProbe,
} from './model';
