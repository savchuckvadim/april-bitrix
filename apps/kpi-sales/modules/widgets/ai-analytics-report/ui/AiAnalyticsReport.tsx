'use client';

import { useAiAnalyticsReport } from '../hooks/use-ai-analytics-report';
import { AiTabHeader } from './AiTabHeader';
import { AiReadinessBanner } from './AiReadinessBanner';
import { AiPulseCard } from './AiPulseCard';
import { AiAttentionList } from './AiAttentionList';
import { AiAgendaCard } from './AiAgendaCard';
import { AiSignalTable } from './AiSignalTable';
import { AiTypesDrawer } from './AiTypesDrawer';
import { AiLevelsDialog } from './AiLevelsDialog';
import { AiKpiOnlyNote } from './components/AiKpiOnlyNote';

/**
 * Вкладка «AI аналитика»: шапка, баннер готовности, пульс, «Внимание»,
 * повестка планёрки, таблица сигналов; второй уровень — разбор по типам
 * (drawer) и уровни менеджеров (диалог руководителя).
 * В kpi-only разборов нет — секции с оценками скрыты с пояснением.
 */
export const AiAnalyticsReport = () => {
    const report = useAiAnalyticsReport();

    return (
        <div className="space-y-4">
            <AiTabHeader
                canViewAll={report.canViewAll}
                canConfigure={report.canConfigure}
                periodClamped={report.periodClamped}
                isRefreshing={report.isRefreshing}
                isRecalculating={report.isRecalculating}
                onRefresh={report.refresh}
                onRecalc={report.recalc}
                onOpenLevels={report.openLevels}
            />
            {report.settings && (
                <AiReadinessBanner settings={report.settings} />
            )}
            {report.kpiOnly ? (
                <AiKpiOnlyNote />
            ) : (
                <>
                    <AiPulseCard canViewAll={report.canViewAll} />
                    <AiAttentionList />
                    <AiAgendaCard />
                    <AiSignalTable />
                    <AiTypesDrawer />
                </>
            )}
            {report.canConfigure && (
                <AiLevelsDialog
                    open={report.levelsOpen}
                    onOpenChange={report.setLevelsOpen}
                />
            )}
        </div>
    );
};
