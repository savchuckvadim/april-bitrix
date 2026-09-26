'use client';

import { RefreshCw } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    aiPlanFactReasonLabel,
    formatAiPlanFactPeriod,
    type AiPlanFact,
} from '@/modules/entities/ai-analytics';
import { useAiPlanFact } from '../hooks/use-ai-plan-fact';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiSectionState } from './components/AiSectionState';
import {
    AiPlanFactTable,
    type AiPlanFactGroup,
} from './components/AiPlanFactTable';

/** Группы таблицы: свод отдела первым, затем менеджеры по имени. */
const groupsOf = (
    planFact: AiPlanFact,
    managerName: (managerId: string) => string,
): AiPlanFactGroup[] => [
    ...(planFact.team.length
        ? [{ key: 'team', title: 'Отдел (свод)', rows: planFact.team }]
        : []),
    ...planFact.rows
        .map(manager => ({
            key: manager.managerId,
            title: managerName(manager.managerId),
            rows: manager.rows,
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'ru')),
];

/**
 * «План — факт» месяца (Фаза 3): цели руководителя из снимка против факта
 * на дату — темп по рабочим дням, прогноз P50, разрыв и «в день надо».
 * Месяц — конец периода фильтра, менеджеры — выбранные в фильтре.
 * Причины деградации (нет снимка целей, месяцы не посчитаны, план дня
 * выключен) — подписями над таблицей.
 */
export const AiPlanFactCard = () => {
    const planFact = useAiPlanFact();
    const loading = planFact.status === 'loading';

    return (
        <SectionCard
            surface="glass"
            title="План — факт месяца"
            description={
                planFact.data
                    ? formatAiPlanFactPeriod(planFact.data)
                    : 'Цели руководителя против факта на дату: темп, прогноз и «в день надо»'
            }
            actions={
                <>
                    <AiHowWeCountButton endpoint="plan-fact" />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={loading || !planFact.hasScope}
                        onClick={planFact.refresh}
                    >
                        <RefreshCw
                            className={cn('h-3 w-3', loading && 'animate-spin')}
                        />
                        Обновить
                    </Button>
                </>
            }
        >
            {!planFact.hasScope ? (
                <p className="py-2 text-xs text-muted-foreground">
                    Период отчёта не задан — месяц реконсиляции неизвестен.
                </p>
            ) : (
                <>
                    <AiSectionState
                        status={planFact.status}
                        error={planFact.error}
                        loadingText="Сверяем план с фактом…"
                        onRetry={planFact.retry}
                    />
                    {planFact.data && (
                        <div className="space-y-3">
                            {planFact.data.reasons.length > 0 && (
                                <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                                    {planFact.data.reasons.map(
                                        (code, index) => (
                                            <li key={code}>
                                                {planFact.data?.reasonTexts[
                                                    index
                                                ] ?? aiPlanFactReasonLabel(code)}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            )}
                            {planFact.data.rows.length ||
                            planFact.data.team.length ? (
                                <AiPlanFactTable
                                    groups={groupsOf(
                                        planFact.data,
                                        planFact.managerName,
                                    )}
                                />
                            ) : (
                                <p className="py-2 text-xs text-muted-foreground">
                                    В периметре нет менеджеров с целями или
                                    фактом за месяц.
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </SectionCard>
    );
};
