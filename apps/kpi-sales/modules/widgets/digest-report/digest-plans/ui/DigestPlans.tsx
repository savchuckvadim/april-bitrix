'use client';

import { DigestSection } from '../../digest-section';
import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import { useDigestPlans } from '../hooks/use-digest-plans';
import { DigestPlansSection } from './DigestPlansSection';

/**
 * «План дня»: связка «запланировано в CRM → план руководителя → факт» по
 * показателям «Планов», рейтинг достигаемости планов и конверсия плана CRM;
 * разбивка Сводный / По отделам / По группам.
 */
export const DigestPlans = () => {
    const plans = useDigestPlans();
    const renderSection = (userIds?: Set<number>) => (
        <DigestPlansSection
            indicators={plans.indicators}
            rows={userIds ? plans.rows.filter(row => userIds.has(row.userId)) : plans.rows}
            expected={plans.expected}
        />
    );

    return (
        <DigestSection
            widget="plan"
            title="План дня"
            description="Факт дня против плана руководителя (цель периода, приведённая к одному дню) и против плана в CRM (события с дедлайном в этот день, конверсия плана). Риска — ожидаемая доля рабочего дня 9:00–18:00. Финансовые показатели в дне не считаются."
        >
            {!plans.visible ? (
                <p className="py-3 text-sm text-muted-foreground">
                    Планы руководителя не настроены или недоступны: кнопка «Планы» в шапке отчёта.
                </p>
            ) : (
                <ReportGroupTabs
                    presentUserIds={plans.presentUserIds}
                    renderSummary={() => renderSection()}
                    renderSection={userIds => renderSection(userIds)}
                />
            )}
        </DigestSection>
    );
};
