'use client';

import { Calculator, RefreshCw, Users } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { AiTabAurora, AiTabTitle, HintTooltip } from '@workspace/april-ui';
import { AI_MAX_PERIOD_MONTHS } from '@/modules/entities/ai-analytics';

interface AiTabHeaderProps {
    /** Руководитель: видит периметр, «Обновить» и «Пересчитать». */
    canViewAll: boolean;
    /** Руководитель op/cup: настраивает уровни менеджеров. */
    canConfigure: boolean;
    /** Период фильтра длиннее лимита — обзор считается за последние 3 месяца. */
    periodClamped: boolean;
    isRefreshing: boolean;
    isRecalculating: boolean;
    onRefresh: () => void;
    onRecalc: () => void;
    onOpenLevels: () => void;
}

/** Шапка вкладки: сияние под стеклом, градиентный заголовок, действия руководителя. */
export const AiTabHeader = ({
    canViewAll,
    canConfigure,
    periodClamped,
    isRefreshing,
    isRecalculating,
    onRefresh,
    onRecalc,
    onOpenLevels,
}: AiTabHeaderProps) => (
    <div className="relative mb-4 overflow-hidden rounded-xl px-4 py-5">
        <AiTabAurora />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div>
                <AiTabTitle>AI аналитика</AiTabTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                    {canViewAll
                        ? 'Разборы звонков вашего периметра: пульс дисциплины, сигналы и повестка планёрки'
                        : 'Разборы ваших звонков: пульс дисциплины и сигналы'}
                    {periodClamped &&
                        ` · обзор считается за последние ${AI_MAX_PERIOD_MONTHS} месяца периода`}
                </p>
            </div>
            {canViewAll && (
                <div className="flex flex-wrap items-center gap-2">
                    {canConfigure && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={onOpenLevels}
                        >
                            <Users className="h-3 w-3" />
                            Уровни
                        </Button>
                    )}
                    <HintTooltip
                        title="Пересчитать обзор"
                        lines={[
                            'Сервер считает обзор заново, минуя кэш; «Внимание» и срез по типу обновятся вслед.',
                        ]}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            disabled={isRecalculating}
                            onClick={onRecalc}
                        >
                            <Calculator
                                className={cn(
                                    'h-3 w-3',
                                    isRecalculating && 'animate-pulse',
                                )}
                            />
                            Пересчитать
                        </Button>
                    </HintTooltip>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={isRefreshing}
                        onClick={onRefresh}
                    >
                        <RefreshCw
                            className={cn(
                                'h-3 w-3',
                                isRefreshing && 'animate-spin',
                            )}
                        />
                        Обновить
                    </Button>
                </div>
            )}
        </div>
    </div>
);
