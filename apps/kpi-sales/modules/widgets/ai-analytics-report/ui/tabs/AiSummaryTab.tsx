'use client';

import { AiPulseCard } from '../AiPulseCard';
import { AiBriefCard } from '../AiBriefCard';
import { AiAttentionList } from '../AiAttentionList';
import { AiAgendaCard } from '../AiAgendaCard';
import { AiDailyPlanCard } from '../AiDailyPlanCard';
import { AiPlanFactCard } from '../AiPlanFactCard';
import { AiForecastCard } from '../AiForecastCard';
import { AiKpiOnlyNote } from '../components/AiKpiOnlyNote';

interface AiSummaryTabProps {
    canViewAll: boolean;
    /** В kpi-only разборов нет — вместо карточек пояснение. */
    kpiOnly: boolean;
    /** Открыть секцию «Цели по уровням» (только тому, кто настраивает). */
    onOpenTargets?: () => void;
}

/**
 * Подвкладка «Сводка»: пульс, итоги периода, «Внимание», повестка
 * планёрки, план дня, план-факт месяца и прогноз отдела (руководителю).
 */
export const AiSummaryTab = ({ canViewAll, kpiOnly, onOpenTargets }: AiSummaryTabProps) => {
    if (kpiOnly) return <AiKpiOnlyNote />;
    return (
        <>
            <AiPulseCard canViewAll={canViewAll} />
            <AiBriefCard />
            <AiAttentionList />
            <AiAgendaCard />
            <AiDailyPlanCard onOpenTargets={onOpenTargets} />
            <AiPlanFactCard />
            <AiForecastCard />
        </>
    );
};
