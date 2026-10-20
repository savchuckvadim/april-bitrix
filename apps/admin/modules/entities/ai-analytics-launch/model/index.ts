import type {
    AiAnalyticsBackfillResultDto,
    AiAnalyticsForecastBacktestDto,
    AiAnalyticsForecastBacktestResultDto,
    AiAnalyticsLaunchCacheResetResultDto,
    AiAnalyticsLaunchReanalysisRunDto,
    AiAnalyticsLaunchStageFlagsResultDto,
    AiAnalyticsLaunchStatusDto,
    AiAnalyticsReanalysisRunStatusDto,
    AiAnalyticsReanalyzeRunResultDto,
    AiAnalyticsReanalyzeStatusDto,
    AiAnalyticsRecomputeResultDto,
    InstallAicallResponseDto,
} from '@workspace/nest-admin-api';
import type { LAUNCH_STEP_CODES } from '../consts/ai-analytics-launch.const';

/**
 * Доменные алиасы generated-типов панели «Запуск AI после выкладки»
 * (`Sales AI Analytics Admin`: launch-status, cache/reset, stage-flags и
 * существующие ручки конвейера, прогноза, переразбора; смарт —
 * `Admin Smarts Management`: install-aicall). Тексты блоков сводки и
 * состояния приходят с бэка (`libs/sales-ai-analytics/src/admin/launch`).
 */
export type LaunchStatus = AiAnalyticsLaunchStatusDto;
export type LaunchReanalysisRun = AiAnalyticsLaunchReanalysisRunDto;
export type LaunchCacheResetResult = AiAnalyticsLaunchCacheResetResultDto;
export type LaunchStageFlagsResult = AiAnalyticsLaunchStageFlagsResultDto;
export type LaunchBackfillResult = AiAnalyticsBackfillResultDto;
export type LaunchRecomputeResult = AiAnalyticsRecomputeResultDto;
export type LaunchBacktestResult = AiAnalyticsForecastBacktestResultDto;
export type LaunchBacktest = AiAnalyticsForecastBacktestDto;
export type LaunchReanalyzeRunResult = AiAnalyticsReanalyzeRunResultDto;
export type LaunchReanalyzeStatus = AiAnalyticsReanalyzeStatusDto;
export type LaunchReanalyzeRunStatus = AiAnalyticsReanalysisRunStatusDto;
export type LaunchInstallSmartResult = InstallAicallResponseDto;

/** Шаг панели по порядку нажатия. */
export type LaunchStepCode = (typeof LAUNCH_STEP_CODES)[number];

/** Состояние шага: как у блоков сводки бэка. */
export type LaunchStepState = 'done' | 'todo' | 'running' | 'unknown';

/** Период дат 'YYYY-MM-DD' или месяцев 'YYYY-MM' (включительно). */
export interface LaunchPeriod {
    from: string;
    to: string;
}

/** Итог нажатия: человеческий текст, сырой ответ и «что дальше». */
export interface LaunchOutcome {
    ok: boolean;
    text: string;
    next?: string;
    /** Ответ сервера как есть — под «подробнее». */
    raw?: unknown;
}
