'use client';

import React, { useMemo } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { ChevronRight } from 'lucide-react';
import type { RatingDataset } from '@/modules/feature/report-rating';
import type { ConversionMethod } from '../model/conversion.types';
import { formatPercent } from '../lib/conversion-calc.util';
import {
    conversionColorVar,
    conversionSegmentGradient,
} from '../lib/conversion-colors.util';

interface ConversionFunnelStripProps {
    dataset: RatingDataset;
    codes: string[];
    method: ConversionMethod;
}

/**
 * Минималистичная воронка-полоса: сегменты слева направо, цвет — цвет
 * показателя (--kpi-action-*, фолбэк — палитра чартов), ширина — доля от
 * базового показателя. Под полосой — легенда с процентами шагов.
 */
export const ConversionFunnelStrip: React.FC<ConversionFunnelStripProps> = ({
    dataset,
    codes,
    method,
}) => {
    const stages = useMemo(() => {
        // Дедуп: цепочка может содержать повторяющийся код показателя.
        const known = [
            ...new Set(
                codes.filter(code =>
                    dataset.actions.some(action => action.code === code),
                ),
            ),
        ];
        if (known.length < 2) return [];
        const totals = known.map(code =>
            dataset.rows.reduce(
                (sum, row) => sum + (row.values[code] ?? 0),
                0,
            ),
        );
        const base = totals[0] ?? 0;
        return known.map((code, i) => {
            const denominator =
                i === 0
                    ? null
                    : method === 'chain'
                      ? (totals[i - 1] ?? 0)
                      : base;
            return {
                code,
                name:
                    dataset.actions.find(action => action.code === code)
                        ?.name || code,
                total: totals[i] ?? 0,
                /** Доля ширины от базы (base=0 → всё по нулям). */
                share: base > 0 ? (totals[i] ?? 0) / base : 0,
                /** % шага к предыдущему/базе; у базы — null. */
                stepPercent:
                    denominator === null
                        ? null
                        : denominator === 0
                          ? null
                          : ((totals[i] ?? 0) / denominator) * 100,
                /** Цвет сегмента — единый резолвер (тот же у графика). */
                color: conversionColorVar(code, i),
                gradient: conversionSegmentGradient(code, i),
            };
        });
    }, [dataset, codes, method]);

    if (!stages.length || (stages[0]?.total ?? 0) === 0) return null;

    return (
        <div className="my-3">
            {/* Сплошная полоса: без зазоров и внутренних скруглений,
                сегменты с лёгким градиентом — скругление только у контейнера */}
            <div className="flex h-4 w-full items-stretch overflow-hidden rounded-full bg-muted">
                {stages.map((stage, i) => (
                    <Tooltip key={`strip-${i}-${stage.code}`}>
                        <TooltipTrigger asChild>
                            <div
                                className="h-full transition-[width] duration-500"
                                style={{
                                    width: `${Math.max(stage.share * 100, 1.5)}%`,
                                    background: stage.gradient,
                                }}
                            />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                            {stage.name}: {stage.total}
                            {stage.stepPercent !== null &&
                                ` · ${formatPercent(stage.stepPercent)}`}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {stages.map((stage, i) => (
                    <React.Fragment key={`strip-legend-${i}-${stage.code}`}>
                        {i > 0 && (
                            <span className="flex items-center gap-0.5 font-medium text-muted-foreground">
                                <ChevronRight className="h-3 w-3" />
                                {formatPercent(stage.stepPercent)}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: stage.color }}
                            />
                            <span className="text-muted-foreground">
                                {stage.name}
                            </span>
                            <span className="font-semibold">{stage.total}</span>
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
