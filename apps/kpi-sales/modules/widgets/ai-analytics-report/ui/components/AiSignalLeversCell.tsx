'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { useAiCallTypeBadge } from '../../hooks/use-ai-call-type-badge';
import {
    AI_LEVER,
    aiLeverHintLines,
    aiLeverTitle,
    formatAiLeverEffect,
    pickAiLevers,
    type AiRecommendation,
} from '../../lib/ai-signal.util';

interface AiSignalLeversCellProps {
    recommendations: AiRecommendation[];
}

/**
 * Рычаги строки (топ-3 из снапшота прогноза): бэйдж рычага с подсказкой
 * (эффект, стоимость, доказательность, опоры, правило), адресат и
 * ожидаемый прирост продаж; без deltaSales (E0) — честно без числа.
 */
export const AiSignalLeversCell = ({
    recommendations,
}: AiSignalLeversCellProps) => {
    const callTypeBadge = useAiCallTypeBadge();
    const callTypeLabel = (code: string) => callTypeBadge(code).label;
    const levers = pickAiLevers(recommendations);

    if (!levers.length) {
        return <span className="text-xs text-muted-foreground">—</span>;
    }

    return (
        <ul className="min-w-44 space-y-1 text-xs">
            {levers.map((recommendation, index) => {
                const lever = AI_LEVER[recommendation.lever];
                return (
                    <li
                        key={`${recommendation.ruleCode}-${index}`}
                        className="flex flex-wrap items-center gap-1"
                    >
                        <HintTooltip
                            title={aiLeverTitle(recommendation, callTypeLabel)}
                            lines={aiLeverHintLines(
                                recommendation,
                                callTypeLabel,
                            )}
                        >
                            <span>
                                <ToneBadge
                                    tone={lever.tone}
                                    variant="outline"
                                    size="sm"
                                >
                                    {lever.label}
                                </ToneBadge>
                            </span>
                        </HintTooltip>
                        <span className="truncate">
                            {aiLeverTitle(recommendation, callTypeLabel)}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                            {formatAiLeverEffect(recommendation)}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
};
