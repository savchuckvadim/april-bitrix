'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { SectionCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    AI_DAILY_PLAN_DISABLED_MESSAGE,
    formatAiPlanFactPeriod,
} from '@/modules/entities/ai-analytics';
import {
    AiDailyPlanBody,
    AiHowWeCountButton,
    AiPlanFactTable,
    AiSectionState,
    AiTheoryLink,
    aiTabHref,
    useAiManagerName,
} from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeDailyPlan } from '../../hooks/use-ai-employee-daily-plan';
import { useAiEmployeeContext } from '../../lib/ai-employee.context';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';

const T = AI_EMPLOYEE_TEXT.target;

/**
 * Подвкладка «К цели»: план и факт месяца сотрудника (таблица одного
 * менеджера), план на сегодня (тот же вид, что на вкладке AI; «Задать
 * цель» ведёт на подвкладку «Сотрудники», секция «Цели по уровням») и
 * честная подсказка про прогноз: он считается по отделу целиком.
 */
export const AiEmployeeTargetTab = () => {
    const { managerId, planFact, canConfigure, kpiOnly } = useAiEmployeeContext();
    const dailyPlan = useAiEmployeeDailyPlan(managerId, !kpiOnly);
    const managerName = useAiManagerName();
    const router = useRouter();
    const openTargets = canConfigure
        ? () => router.push(aiTabHref('employees', 'targets'))
        : undefined;
    const dailyLoading = dailyPlan.status === 'loading';

    return (
        <>
            <SectionCard
                surface="glass"
                title={T.planFact.title}
                description={planFact.data ? formatAiPlanFactPeriod(planFact.data) : T.planFact.description}
                actions={
                    <>
                        <AiTheoryLink topic="planFact" variant="icon" />
                        <AiHowWeCountButton endpoint="plan-fact" />
                    </>
                }
            >
                <AiSectionState
                    status={planFact.status}
                    error={planFact.error}
                    loadingText={T.planFact.loading}
                    onRetry={planFact.retry}
                />
                {planFact.status === 'ready' && planFact.rows.length === 0 && (
                    <p className="py-2 text-xs text-muted-foreground">{T.planFact.empty}</p>
                )}
                {planFact.rows.length > 0 && (
                    <AiPlanFactTable
                        flat
                        groups={[{ key: managerId, title: managerName(managerId), rows: planFact.rows }]}
                    />
                )}
            </SectionCard>

            <SectionCard
                surface="glass"
                title={T.dailyPlan.title}
                description={T.dailyPlan.description}
                actions={
                    <>
                        <AiTheoryLink topic="dailyPlan" variant="icon" />
                        <AiHowWeCountButton endpoint="plan/daily" />
                        {!dailyPlan.disabled && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 text-xs"
                                disabled={dailyLoading}
                                onClick={dailyPlan.refresh}
                            >
                                <RefreshCw className={cn('h-3 w-3', dailyLoading && 'animate-spin')} />
                                Обновить
                            </Button>
                        )}
                    </>
                }
            >
                {dailyPlan.disabled ? (
                    <p className="py-2 text-xs text-muted-foreground">
                        {AI_DAILY_PLAN_DISABLED_MESSAGE}
                    </p>
                ) : (
                    <>
                        <AiSectionState
                            status={dailyPlan.status}
                            error={dailyPlan.error}
                            loadingText={T.dailyPlan.loading}
                            onRetry={dailyPlan.refresh}
                        />
                        {dailyPlan.data && dailyPlan.view && (
                            <AiDailyPlanBody
                                plan={dailyPlan.data}
                                view={dailyPlan.view}
                                onOpenTargets={openTargets}
                            />
                        )}
                    </>
                )}
            </SectionCard>

            <SectionCard
                surface="glass"
                density="compact"
                title={T.forecast.title}
                actions={<AiTheoryLink topic="forecast" variant="icon" />}
            >
                <p className="text-sm text-muted-foreground">{T.forecast.note}</p>
                <Link
                    href={aiTabHref('summary')}
                    className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                    {T.forecast.link}
                </Link>
            </SectionCard>
        </>
    );
};
