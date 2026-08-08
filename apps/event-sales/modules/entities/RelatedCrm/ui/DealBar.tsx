'use client';

import { FC, useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { StageProgress } from '@workspace/april-ui';
import type { RelationDeal } from '../lib/resolve-task-relation';
import type { StageDictItem } from '../lib/bound-deal-view';
import { dealAmount } from '../lib/stage-view';
import { segmentIndexFromPointer } from '../lib/stage-pointer';

interface DealBarProps {
    deal: RelationDeal;
    /** Доля пройденной воронки 0..1 — родитель уже отфильтровал нерисуемые. */
    progress: number;
    /** Словарь стадий воронки; пока не доехал — тултип только про текущую. */
    dict?: StageDictItem[];
}

/**
 * Одна полоска сделки с посегментным тултипом: наведение на участок трека
 * показывает название ЭТОЙ стадии, отдельной строкой — текущая с позицией.
 * Янтарная точка справа — сделка привязана к задаче, но в графе связей
 * клиента её нет (создана без CRM-связей).
 */
export const DealBar: FC<DealBarProps> = ({ deal, progress, dict }) => {
    const [hovered, setHovered] = useState<number | null>(null);

    // Словарь (без стадий-провалов) — источник истины для шкалы: заполнение,
    // насечки и тултип считаются от него, чтобы не расходиться. Пока словарь
    // не доехал (или стадия сделки в нём не нашлась — например, сделка стоит
    // на отказе) — честный фолбэк на order/total из графа.
    const dictIndex = dict
        ? dict.findIndex(item => item.statusId === deal.stage.bitrixId)
        : -1;
    const total =
        dictIndex >= 0 && dict ? dict.length : (deal.stage.total ?? 0);
    const value =
        dictIndex >= 0 && dict ? (dictIndex + 1) / dict.length : progress;
    const currentIndex = dictIndex >= 0 ? dictIndex : (deal.stage.order ?? -1);
    const currentName =
        deal.stage.title ?? dict?.[currentIndex]?.name ?? deal.stage.bitrixId;

    const hoveredIndex = hovered ?? currentIndex;
    const hoveredName = dict?.[hoveredIndex]?.name ?? currentName;
    const isCurrentHovered = hoveredIndex === currentIndex;
    const position =
        currentIndex >= 0 && total > 0 ? ` · ${currentIndex + 1} / ${total}` : '';

    // Живые цвета пройденных стадий из настроек воронки портала: градиент
    // растекается от первой стадии к текущей и ЗАКАНЧИВАЕТСЯ её цветом
    // (дошли до «Переговоров» — конец зелёный, до «Презентации» — жёлтый).
    // Не у всех стадий есть цвет — тогда честный фолбэк на токен-рампу.
    const portalRamp =
        dictIndex >= 0 && dict
            ? dict
                  .slice(0, dictIndex + 1)
                  .map(item => item.color)
                  .filter((color): color is string => Boolean(color))
            : [];
    const hasPortalRamp = dictIndex >= 0 && portalRamp.length === dictIndex + 1;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    tabIndex={0}
                    aria-label={`${deal.title}: ${currentName}`}
                    className="flex cursor-default items-center gap-1.5 rounded-sm py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onMouseMove={event => {
                        const index = segmentIndexFromPointer(event, total);
                        setHovered(index >= 0 ? index : null);
                    }}
                    onMouseLeave={() => setHovered(null)}
                >
                    <StageProgress
                        value={value}
                        total={total || undefined}
                        ramp={hasPortalRamp ? portalRamp : undefined}
                        rampScope={hasPortalRamp ? 'fill' : 'track'}
                        shimmer
                        className="min-w-0 flex-1"
                    />
                    {deal.isOutsideClientGraph && (
                        <span
                            aria-hidden
                            className="size-1.5 shrink-0 rounded-full bg-warning"
                        />
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
                <p className="text-primary-foreground/70">{deal.title}</p>
                <p className="font-medium">
                    {hoveredName}
                    {isCurrentHovered ? ' — текущая' : ''}
                </p>
                {!isCurrentHovered && (
                    <p className="text-primary-foreground/70">
                        Текущая: {currentName}
                        {position}
                    </p>
                )}
                {dealAmount(deal.opportunity) && (
                    <p>{dealAmount(deal.opportunity)}</p>
                )}
            </TooltipContent>
        </Tooltip>
    );
};
