'use client';

import { AiPulseCard } from '../AiPulseCard';
import { AiBriefCard } from '../AiBriefCard';
import { AiAttentionList } from '../AiAttentionList';
import { AiAgendaCard } from '../AiAgendaCard';
import { AiDailyPlanCard } from '../AiDailyPlanCard';
// План-факт на сводке скрыт по решению владельца (05.11.2026: виджет
// непонятный и неинформативный); вернуть — раскомментировать импорт и
// карточку ниже. План-факт сотрудника на его странице остаётся.
// import { AiPlanFactCard } from '../AiPlanFactCard';
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
 * планёрки, план дня и прогноз отдела (руководителю); план-факт месяца
 * пока скрыт.
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
            {/* <AiPlanFactCard /> — скрыт 05.11.2026, см. импорт выше */}
            <AiForecastCard />
        </>
    );
};
