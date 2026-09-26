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
 * Вкладка «AI аналитика»: шапка, «Готовность витрины» с чек-листом
 * «донастроить или просто подождать?», пульс, AI-резюме периода,
 * «Внимание», повестка планёрки, слепая оценка (руководителю), план дня,
 * план-факт месяца, таблица сигналов; второй уровень — разбор по типам
 * (drawer), стиль менеджера, «Как считаем» и настройки витрины (диалог
 * руководителя: уровни, цели, отсутствия, состав — пункты чек-листа и
 * «Задать цель» плана дня открывают нужную вкладку). В kpi-only разборов
 * нет — секции с оценками скрыты с пояснением.
 */
export const AiAnalyticsReport = () => {
    const report = useAiAnalyticsReport();
    const onOpenSettings = report.canConfigure
        ? report.openSettings
        : undefined;

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
            {report.settings && report.checklist && (
                <AiReadinessBanner
                    settings={report.settings}
                    checklist={report.checklist}
                    onOpenSettings={onOpenSettings}
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
                    <AiDailyPlanCard
                        onOpenTargets={
                            report.canConfigure ? report.openTargets : undefined
                        }
                    />
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
