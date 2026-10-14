'use client';

import { SectionCard } from '@workspace/april-ui';
import { PlansAchievementTable } from '@/modules/feature/plans';
import { useDigestPlans } from '../hooks/use-digest-plans';

/** «План дня»: цели руководителя, приведённые к одному дню, против факта дня. */
export const DigestPlans = () => {
    const plans = useDigestPlans();
    if (!plans.visible) return null;

    return (
        <SectionCard
            surface="glass"
            title="План дня"
            description="Цель периода (месяц/квартал/год), приведённая к одному календарному дню, против факта этого дня. Риска — ожидаемая доля рабочего дня 9:00–18:00. Финансовые показатели в дне не считаются."
        >
            <PlansAchievementTable
                indicators={plans.indicators}
                rows={plans.rows}
                totals={plans.totals}
                expected={plans.expected}
            />
        </SectionCard>
    );
};
