'use client';

import { Calculator, RefreshCw, Settings2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import {
    AiTabAurora,
    AiTabTitle,
    HintTooltip,
    ToneBadge,
} from '@workspace/april-ui';
import {
    AI_SCOPE_TEXT,
    isAiScopeChipVisible,
    type AiScopeNote,
} from '@/modules/entities/ai-analytics';
import {
    AI_TAB_HEADER_TEXT,
    type AiClampedPeriod,
} from '../lib/ai-tab-header.texts';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';

interface AiTabHeaderProps {
    /** Руководитель: видит периметр, «Обновить» и «Пересчитать». */
    canViewAll: boolean;
    /** Руководитель op/cup: настраивает витрину. */
    canConfigure: boolean;
    /** Период обрезан до лимита бэка: даты AI и даты фильтра; null — не обрезан. */
    clampedPeriod: AiClampedPeriod | null;
    /** Периметр разбора (meta.scope обзора); null — обзора ещё нет. */
    scope: AiScopeNote | null;
    isRefreshing: boolean;
    isRecalculating: boolean;
    onRefresh: () => void;
    onRecalc: () => void;
    onOpenSettings: () => void;
}

const T = AI_TAB_HEADER_TEXT;

/** Чип «Только сотрудники из разбора: N» с подсказкой; при скрытых — «скрыто K». */
const AiScopeChip = ({ scope }: { scope: AiScopeNote }) => (
    <HintTooltip title={AI_SCOPE_TEXT.chipHint.title} lines={[...AI_SCOPE_TEXT.chipHint.lines]}>
        <span>
            <ToneBadge tone="info" variant="soft" size="sm">
                {AI_SCOPE_TEXT.chip(scope.shownManagers)}
                {scope.hiddenByPilot > 0 &&
                    ` · ${AI_SCOPE_TEXT.hidden(scope.hiddenByPilot)}`}
            </ToneBadge>
        </span>
    </HintTooltip>
);

/**
 * Шапка вкладки: сияние под стеклом, градиентный заголовок, чип периметра
 * разбора, заметная плашка обрезанного периода с точными датами, «Как
 * считаем» для всех и действия руководителя с подсказками.
 */
export const AiTabHeader = ({
    canViewAll,
    canConfigure,
    clampedPeriod,
    scope,
    isRefreshing,
    isRecalculating,
    onRefresh,
    onRecalc,
    onOpenSettings,
}: AiTabHeaderProps) => (
    <div className="relative mb-4 overflow-hidden rounded-xl px-4 py-5">
        <AiTabAurora />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
                <AiTabTitle>{T.title}</AiTabTitle>
                <p className="text-xs text-muted-foreground">
                    {canViewAll ? T.subtitleAll : T.subtitleSelf}
                </p>
                {isAiScopeChipVisible(scope) && scope && (
                    <AiScopeChip scope={scope} />
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <AiHowWeCountButton endpoint="overview" />
                {canViewAll && canConfigure && (
                    <HintTooltip
                        title={T.settings.hint.title}
                        lines={[...T.settings.hint.lines]}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={onOpenSettings}
                        >
                            <Settings2 className="h-3 w-3" />
                            {T.settings.label}
                        </Button>
                    </HintTooltip>
                )}
                {canViewAll && (
                    <>
                        <HintTooltip
                            title={T.recalc.hint.title}
                            lines={[...T.recalc.hint.lines]}
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
                                {T.recalc.label}
                            </Button>
                        </HintTooltip>
                        <HintTooltip
                            title={T.refresh.hint.title}
                            lines={[...T.refresh.hint.lines]}
                        >
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
                                {T.refresh.label}
                            </Button>
                        </HintTooltip>
                    </>
                )}
            </div>
        </div>
        {clampedPeriod && (
            <p className="relative z-10 mt-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
                {T.clamped(clampedPeriod)}
            </p>
        )}
    </div>
);
