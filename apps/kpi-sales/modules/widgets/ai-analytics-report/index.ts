// Виджет вкладки «AI аналитика» (грузится лениво из report-view/blocks/lazy).
export { AiAnalyticsReport } from './ui/AiAnalyticsReport';

// Переиспользуемые части для AI-раздела страницы сотрудника (widgets/ai-employee):
// хуки данных, тела карточек стиля и досье, таблицы и утилиты вида.
export { useAiManagerName } from './hooks/use-ai-manager-name';
export { useAiManagerLink } from './hooks/use-ai-manager-link';
export { useAiDossier } from './hooks/use-ai-dossier';
export { useAiStyle } from './hooks/use-ai-style';
export { useAiTypesMatrix } from './hooks/use-ai-types-matrix';
export { useAiSectionsMatrix } from './hooks/use-ai-sections-matrix';
export { AiManagerName } from './ui/components/AiManagerName';
export { AiLevelBadge } from './ui/components/AiLevelBadge';
export { AiStyleCardBody, AiStyleCardMeta } from './ui/components/AiStyleCardBody';
export { AiDossierBody, AiDossierToolbar } from './ui/components/AiDossierBody';
export { AiDossierSeries } from './ui/components/AiDossierSeries';
export { AiDossierTrends } from './ui/components/AiDossierTrends';
export { AiDossierYoy } from './ui/components/AiDossierYoy';
export { AiPlanFactTable } from './ui/components/AiPlanFactTable';
export { AiDailyPlanBody } from './ui/components/AiDailyPlanBody';
export { AiSectionState } from './ui/components/AiSectionState';
export { AiQueuedState } from './ui/components/AiQueuedState';
export { AiCardLink } from './ui/components/AiCardLink';
export { AiSignalLeversCell } from './ui/components/AiSignalLeversCell';
export { AiRopMarkSaved } from './ui/components/AiRopMarkSaved';
export { AiTheoryLink } from './ui/components/AiTheoryLink';
export { AiHowWeCountButton } from './ui/components/AiHowWeCountButton';
export { AiCallTypeBadge } from './ui/components/AiCallTypeBadge';
export { AiKpiOnlyNote } from './ui/components/AiKpiOnlyNote';
export { buildAiDailyPlanView } from './lib/ai-daily-plan-view.util';
export type { AiDailyPlanView } from './lib/ai-daily-plan-view.util';
export { formatAiPlanDate } from './lib/ai-daily-plan.util';
export {
    AI_PROFILE_ALL,
    aiProfileChartData,
    aiProfileChartOptions,
    buildAiProfileChart,
} from './lib/ai-matrix-profile-chart.util';
export type { AiProfileChart } from './lib/ai-matrix-profile-chart.util';
export { AI_MATRIX_BLOCK_TEXT } from './lib/ai-matrix-texts';
export {
    AI_RISK_CALL_LINK_LABEL,
    AI_RISK_CALL_LINK_TITLE,
    aiRiskCallLink,
    aiRiskCallNoLinkText,
} from './lib/ai-risk-calls.util';
export { aiCardLink } from './lib/ai-card-link.util';
export { aiTabHref } from './lib/ai-tabs';
export type { AiTabKey } from './lib/ai-tabs';
export type { AiSettingsTab } from './lib/ai-settings-form.util';
export type { AiPlanFactGroup } from './lib/ai-plan-fact-view.util';
