import type {
    AiAnalyticsSettings,
    AiCallReportStatus,
    AiManagerRow,
    AiOverview,
    AiReadiness,
} from '@/modules/entities/ai-analytics';
import {
    managerRow,
    managerTrends,
    overview,
    yoy,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import type {
    AiChecklistInput,
    AiChecklistItem,
    AiChecklistItemCode,
} from '../ai-setup-checklist.types';
import { buildAiChecklistItems } from '../ai-setup-checklist.util';

/*
 * Фикстуры чек-листа «Готовность витрины»: по умолчанию портал в полной
 * готовности (verdict ready) — тест меняет ровно то, что проверяет.
 */

export const TODAY = '2026-09-26';

/** Конвейер разбора: включён, без пилота, дефолты портала. */
export const callReport = (
    overrides: Partial<AiCallReportStatus> = {},
): AiCallReportStatus => ({
    enabled: true,
    pilotUserIds: null,
    salesOnly: null,
    minDurationSec: null,
    ...overrides,
});

/** Готовность «нормы по данным»: причин нет, β оценена по данным. */
export const readiness = (
    overrides: Partial<AiReadiness> = {},
): AiReadiness => ({
    mode: 'norms',
    historyMonths: 12,
    presentations: 150,
    sales: 20,
    comparableFrom: '2026-01-10',
    betaSource: 'data',
    reasons: [],
    ...overrides,
});

/** settings/get портала, где всё настроено. */
export const settings = (
    overrides: Partial<AiAnalyticsSettings> = {},
): AiAnalyticsSettings => ({
    enabled: true,
    pipelineEnabled: true,
    auditEnabled: false,
    alertsEnabled: true,
    digestEnabled: true,
    readiness: readiness(),
    callTypes: [],
    comparableFrom: '2026-01-10',
    ropUserIds: [42],
    selfViewEnabled: true,
    dailyPlanEnabled: true,
    digestAllUserIds: ['42'],
    poolOptIn: false,
    poolConsentAt: null,
    experimentsEnabled: false,
    targets: {
        byLevel: [
            { level: 'middle', sales: 5, presentationsMin: 0, coldPerDay: 40 },
        ],
        overrides: [],
    },
    absences: [],
    rosterConfirmedAt: '2026-09-01',
    callReport: callReport(),
    ...overrides,
});

/** Уровень из ночного паспорта: стаж по дате приёма в Bitrix. */
export const passportRow = (
    overrides: Partial<AiManagerRow> = {},
): AiManagerRow =>
    managerRow({
        levelSource: 'passport',
        since: '2025-11-03',
        sinceSource: 'employment',
        tenureMonths: 10,
        ...overrides,
    });

/** Обзор, где тренды и «год назад» уже есть. */
export const readyOverview = (
    managers: AiManagerRow[] = [
        passportRow({ trends: managerTrends(), yoy: yoy() }),
    ],
): AiOverview => ({ ...overview(managers), comparableFrom: '2026-01-10' });

export const checklistInput = (
    overrides: Partial<AiChecklistInput> = {},
): AiChecklistInput => ({
    settings: settings(),
    overview: readyOverview(),
    overviewError: null,
    dailyPlan: null,
    planFact: null,
    managerName: managerId => `Менеджер ${managerId}`,
    today: TODAY,
    canConfigure: true,
    ...overrides,
});

/** Пункт по коду (первый); нет — undefined. */
export const findItem = (
    items: readonly AiChecklistItem[],
    code: AiChecklistItemCode,
): AiChecklistItem | undefined => items.find(item => item.code === code);

/** Собрать пункты и вернуть один по коду. */
export const itemOf = (
    code: AiChecklistItemCode,
    overrides: Partial<AiChecklistInput> = {},
): AiChecklistItem | undefined =>
    findItem(buildAiChecklistItems(checklistInput(overrides)), code);
