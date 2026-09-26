'use client';

import { useAiAnalyticsReport } from '../hooks/use-ai-analytics-report';
import { AiTabHeader } from './AiTabHeader';
import { AiReadinessBanner } from './AiReadinessBanner';
import { AiPulseCard } from './AiPulseCard';
import { AiBriefCard } from './AiBriefCard';
import { AiRopMarkCard } from './AiRopMarkCard';
import { AiDailyPlanCard } from './AiDailyPlanCard';
import { AiPlanFactCard } from './AiPlanFactCard';
import { AiAttentionList } from './AiAttentionList';
import { AiAgendaCard } from './AiAgendaCard';
import { AiSignalTable } from './AiSignalTable';
import { AiTypesDrawer } from './AiTypesDrawer';
import { AiLevelsDialog } from './AiLevelsDialog';
import { AiKpiOnlyNote } from './components/AiKpiOnlyNote';

/**
 * Вкладка «AI аналитика»: шапка, баннер готовности, пульс, AI-резюме
 * периода, «Внимание», повестка планёрки, слепая оценка (руководителю),
 * план дня, план-факт месяца, таблица сигналов; второй уровень — разбор по типам (drawer),
 * стиль менеджера (диалог из строки таблицы), «Как считаем» (кнопки в
 * шапках секций) и настройки витрины (диалог руководителя: уровни, цели,
 * отсутствия, состав — баннер готовности открывает вкладку «Состав»).
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
                <AiReadinessBanner
                    settings={report.settings}
                    onConfirmRoster={
                        report.canConfigure ? report.openRoster : undefined
                    }
                />
            )}
            {report.kpiOnly ? (
                <AiKpiOnlyNote />
            ) : (
                <>
                    <AiPulseCard canViewAll={report.canViewAll} />
                    <AiBriefCard />
                    <AiAttentionList />
                    <AiAgendaCard />
                    <AiRopMarkCard />
                    <AiDailyPlanCard />
                    <AiPlanFactCard />
                    <AiSignalTable />
                    <AiTypesDrawer />
                </>
            )}
            {report.canConfigure && (
                <AiLevelsDialog
                    open={report.levelsOpen}
                    onOpenChange={report.setLevelsOpen}
                    initialTab={report.levelsTab}
                />
            )}
        </div>
    );
};
