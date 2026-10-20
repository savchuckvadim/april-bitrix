import {
    customAxios,
    getSalesAiAnalyticsAdmin,
} from '@workspace/nest-admin-api';
import {
    LAUNCH_INSTALL_TIMEOUT_MS,
    LAUNCH_RECOMPUTE_STEPS,
} from '../../consts/ai-analytics-launch.const';
import type {
    LaunchBackfillResult,
    LaunchBacktestResult,
    LaunchCacheResetResult,
    LaunchInstallSmartResult,
    LaunchPeriod,
    LaunchRecomputeResult,
    LaunchReanalyzeRunResult,
    LaunchReanalyzeStatus,
    LaunchStageFlagsResult,
    LaunchStatus,
} from '../../model';

/** Тот же адрес, что у сгенерированного smartInstallAicall (нужен свой таймаут). */
const INSTALL_AICALL_URL = '/api/admin/pbx/smarts/install-aicall';

/**
 * Единственное место импорта `@workspace/nest-admin-api` для панели
 * «Запуск AI после выкладки»: сводка, кэш, флаги ступеней — новые ручки
 * `Sales AI Analytics Admin`; догон, пересчёт, проверка точности и
 * переразбор — существующие; смарт — `install-aicall` (через `customAxios`
 * с таймаутом 3 минуты: установка идёт в Bitrix, дефолтных 30 с мало).
 */
export class AiAnalyticsLaunchHelper {
    private api: ReturnType<typeof getSalesAiAnalyticsAdmin>;

    constructor() {
        this.api = getSalesAiAnalyticsAdmin();
    }

    status(domain: string): Promise<LaunchStatus> {
        return this.api.aiAnalyticsLaunchAdminStatus({ domain });
    }

    installSmart(domain: string): Promise<LaunchInstallSmartResult> {
        return customAxios<LaunchInstallSmartResult>({
            url: INSTALL_AICALL_URL,
            method: 'POST',
            data: { domain },
            timeout: LAUNCH_INSTALL_TIMEOUT_MS,
        });
    }

    resetCache(domain: string): Promise<LaunchCacheResetResult> {
        return this.api.aiAnalyticsLaunchAdminResetCache({
            domain,
            scope: 'all',
        });
    }

    backfill(
        domain: string,
        months: LaunchPeriod,
    ): Promise<LaunchBackfillResult> {
        return this.api.aiAnalyticsPipelineAdminBackfill({
            domain,
            from: months.from,
            to: months.to,
        });
    }

    restoreForecast(
        domain: string,
        monthKey: string,
    ): Promise<LaunchRecomputeResult> {
        return this.api.aiAnalyticsPipelineAdminRecompute({
            domain,
            rhythm: 'monthly',
            monthKey,
            steps: [...LAUNCH_RECOMPUTE_STEPS],
        });
    }

    checkForecast(domain: string): Promise<LaunchBacktestResult> {
        return this.api.aiAnalyticsPhase4AdminForecastBacktest({
            domain,
            months: 1,
        });
    }

    showForecast(
        domain: string,
        force: boolean,
    ): Promise<LaunchStageFlagsResult> {
        return this.api.aiAnalyticsLaunchAdminSetStageFlags({
            domain,
            forecast: true,
            ...(force ? { force: true } : {}),
        });
    }

    /** Переразбор периода; пилот портала по умолчанию (userIds не передаются). */
    reanalyze(
        domain: string,
        period: LaunchPeriod,
        dryRun: boolean,
    ): Promise<LaunchReanalyzeRunResult> {
        return this.api.aiAnalyticsReanalyzeAdminRun({
            domain,
            from: period.from,
            to: period.to,
            dryRun,
        });
    }

    reanalyzeStatus(
        domain: string,
        period: LaunchPeriod,
    ): Promise<LaunchReanalyzeStatus> {
        return this.api.aiAnalyticsReanalyzeAdminStatus({
            domain,
            from: period.from,
            to: period.to,
        });
    }
}
