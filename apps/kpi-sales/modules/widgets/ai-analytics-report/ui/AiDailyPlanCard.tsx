'use client';

import { RefreshCw } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useAiDailyPlan } from '../hooks/use-ai-daily-plan';
import { formatAiPlanDate } from '../lib/ai-daily-plan.util';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiSectionState } from './components/AiSectionState';
import { AiDailyPlanDisabledNote } from './components/AiDailyPlanDisabledNote';
import { AiDailyPlanToolbar } from './components/AiDailyPlanToolbar';
import { AiDailyPlanBody } from './components/AiDailyPlanBody';

interface AiDailyPlanCardProps {
    /** Чей план открыть первым (руководителю; менеджер видит только свой). */
    defaultManagerId?: string;
    /**
     * Открыть настройки витрины на вкладке «Цели по уровням». Передаётся
     * только тому, кто может настраивать: есть — в состоянии «цели нет»
     * кнопка «Задать цель», нет — «Попросите руководителя отдела задать цель».
     */
    onOpenTargets?: () => void;
}

type DailyPlanState = ReturnType<typeof useAiDailyPlan>;

/** Почему план ещё не запрошен: нет менеджера / нет периметра / битая дата. */
const emptyHint = (plan: DailyPlanState): string | null => {
    if (!plan.dateValid) return 'Укажите день плана в формате ГГГГ-ММ-ДД.';
    if (plan.managerId) return null;
    if (!plan.isLeader) {
        return 'Не удалось определить пользователя — план дня недоступен.';
    }
    // Руководителю подсказку «ждём обзор» показывает панель выбора.
    return plan.overviewPending
        ? null
        : 'В периметре нет менеджеров с данными обзора — план строить не по кому.';
};

/**
 * «План дня» — обратная задача от цели месяца: простой заголовок, цель и
 * прогресс, строки в порядке воронки, «Как посчитано» и служебный блок
 * руководителя; без цели — пустое состояние (AiDailyPlanBody). Выбор
 * менеджера (руководителю — из периметра обзора) и дня; гейт настройки
 * портала dailyPlanEnabled; «Обновить» — повторный запрос, минуя кэш.
 */
export const AiDailyPlanCard = ({
    defaultManagerId,
    onOpenTargets,
}: AiDailyPlanCardProps) => {
    const plan = useAiDailyPlan(defaultManagerId);
    const loading = plan.status === 'loading';
    const hint = emptyHint(plan);

    return (
        <SectionCard
            surface="glass"
            title="План дня"
            description={
                plan.data
                    ? `${plan.managerName(plan.data.managerId)} · ${formatAiPlanDate(plan.data.date)}`
                    : 'Сколько активности нужно сегодня, чтобы выйти на цель месяца'
            }
            actions={
                <>
                    <AiHowWeCountButton endpoint="plan/daily" />
                    {!plan.disabled && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            disabled={loading || hint !== null}
                            onClick={plan.refresh}
                        >
                            <RefreshCw
                                className={cn(
                                    'h-3 w-3',
                                    loading && 'animate-spin',
                                )}
                            />
                            Обновить
                        </Button>
                    )}
                </>
            }
        >
            {plan.disabled ? (
                <AiDailyPlanDisabledNote />
            ) : (
                <div className="space-y-4">
                    <AiDailyPlanToolbar
                        isLeader={plan.isLeader}
                        options={plan.options}
                        managerId={plan.managerId}
                        managerName={plan.managerName}
                        overviewPending={plan.overviewPending}
                        date={plan.date}
                        dateValid={plan.dateValid}
                        onManager={plan.selectManager}
                        onDate={plan.setDate}
                    />
                    {hint ? (
                        <p className="py-2 text-xs text-muted-foreground">
                            {hint}
                        </p>
                    ) : (
                        plan.managerId && (
                            <>
                                <AiSectionState
                                    status={plan.status}
                                    error={plan.error}
                                    loadingText="Считаем план дня…"
                                    onRetry={plan.refresh}
                                />
                                {plan.data && plan.view && (
                                    <AiDailyPlanBody
                                        plan={plan.data}
                                        view={plan.view}
                                        onOpenTargets={onOpenTargets}
                                    />
                                )}
                            </>
                        )
                    )}
                </div>
            )}
        </SectionCard>
    );
};
