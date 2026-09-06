/**
 * Разбор адреса админки на флаги разделов.
 *
 * Вынесено из `useDeepRouting` чистой функцией намеренно: раздел портала
 * вычисляется сравнением сегментов пути, и каждый новый раздел (`keys`,
 * `app-settings`, `questionnaires`, …) обязан попасть сразу в ДВА места —
 * в свой флаг и в список исключений `isPortalDetail`. Забытое исключение
 * не ломает сборку, оно тихо оставляет на новом экране навигацию карточки
 * портала. Тесты на чистую функцию ловят это до релиза.
 */

/** Флаги текущего маршрута: какой раздел админки открыт. */
export interface DeepRoute {
    isGarant: boolean;
    isPortal: boolean;
    isClient: boolean;
    isMarketplace: boolean;
    isPortalList: boolean;
    isPortalGarant: boolean;
    isPortalPbx: boolean;
    isPortalKeys: boolean;
    isPortalAiSettings: boolean;
    isPortalAppSettings: boolean;
    /** Раздел «Анкеты» карточки портала. */
    isPortalQuestionnaires: boolean;
    isPortalProvider: boolean;
    portalId: string;
    /** Карточка портала: портал открыт, но ни один его раздел не выбран. */
    isPortalDetail: boolean;
    isDashboard: boolean;
    isStatistics: boolean;
    isPortalStatistics: boolean;
    isEvent: boolean;
    isKonstructor: boolean;
    isAiKnowledge: boolean;
    /** Раздел «AI-аналитика ОП» (верхний уровень, вне портала). */
    isAiAnalytics: boolean;
    /** Экран «Аудит данных» раздела AI-аналитики. */
    isAiAnalyticsAudit: boolean;
    isPortalEvent: boolean;
    isPortalKonstructor: boolean;
    isStatisticsTranscription: boolean;
    isStatisticsAi: boolean;
    isPortalStatisticsTranscription: boolean;
    isPortalStatisticsAi: boolean;
}

/**
 * Флаги разделов по пути и id портала из параметров маршрута.
 *
 * Сегменты считаются от корня: `/portal/42/questionnaires` — это
 * `['', 'portal', '42', 'questionnaires']`, поэтому раздел портала всегда
 * лежит в третьем индексе, а вложенный экран статистики — в четвёртом.
 */
export const resolveDeepRoute = (
    pathname: string,
    portalId: string,
): DeepRoute => {
    const segments = (pathname ?? '').split('/');
    const root = segments[1];
    const second = segments[2];
    const portalSection = segments[3];
    const portalSubSection = segments[4];

    const isGarant = root === 'garant';
    const isPortal = root === 'portal';
    const isClient = root === 'client';
    const isMarketplace = root === 'marketplace';
    const isDashboard = root === 'dashboard';
    const isStatistics = root === 'statistics';
    const isEvent = root === 'event';
    const isKonstructor = root === 'konstructor';
    const isAiKnowledge = root === 'ai-knowledge';
    const isAiAnalytics = root === 'ai-analytics';
    const isAiAnalyticsAudit = isAiAnalytics && second === 'audit';
    const isPortalList = isPortal && second === 'list';

    const isPortalGarant = isPortal && portalSection === 'garant';
    const isPortalPbx = isPortal && portalSection === 'pbx';
    const isPortalKeys = isPortal && portalSection === 'keys';
    const isPortalAiSettings = isPortal && portalSection === 'ai-settings';
    const isPortalAppSettings = isPortal && portalSection === 'app-settings';
    const isPortalQuestionnaires =
        isPortal && portalSection === 'questionnaires';
    const isPortalProvider = isPortal && portalSection === 'provider';
    const isPortalStatistics = isPortal && portalSection === 'statistics';
    const isPortalKonstructor = isPortal && portalSection === 'konstructor';
    const isPortalEvent = isPortal && portalSection === 'event';

    // Карточка портала — это «портал без раздела»: каждый новый раздел
    // обязан быть исключением, иначе он получит навигацию карточки.
    const isPortalDetail = Boolean(
        isPortal &&
            portalId &&
            !isPortalGarant &&
            !isPortalPbx &&
            !isPortalKeys &&
            !isPortalAiSettings &&
            !isPortalAppSettings &&
            !isPortalQuestionnaires &&
            !isPortalProvider &&
            !isPortalKonstructor,
    );

    const isStatisticsTranscription = isStatistics && second === 'transcription';
    const isStatisticsAi = isStatistics && second === 'ai';

    const isPortalStatisticsTranscription =
        isPortalStatistics && portalSubSection === 'transcription';
    const isPortalStatisticsAi =
        isPortalStatistics && portalSubSection === 'ai';

    return {
        isGarant,
        isPortal,
        isClient,
        isMarketplace,
        isPortalList,
        isPortalGarant,
        isPortalPbx,
        isPortalKeys,
        isPortalAiSettings,
        isPortalAppSettings,
        isPortalQuestionnaires,
        isPortalProvider,
        portalId,
        isPortalDetail,
        isDashboard,
        isStatistics,
        isPortalStatistics,
        isEvent,
        isKonstructor,
        isAiKnowledge,
        isAiAnalytics,
        isAiAnalyticsAudit,
        isPortalEvent,
        isPortalKonstructor,
        isStatisticsTranscription,
        isStatisticsAi,
        isPortalStatisticsTranscription,
        isPortalStatisticsAi,
    };
};
