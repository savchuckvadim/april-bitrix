'use client';

import { Check, ThumbsDown } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { useAiCallTypeBadge } from '../../hooks/use-ai-call-type-badge';
import { useAiFeedback } from '../../hooks/use-ai-feedback';
import { aiLeverView } from '../../lib/ai-lever-view.util';
import {
    aiLeverHintLines,
    aiLeverTitle,
    formatAiLeverEffect,
    pickAiLevers,
    type AiRecommendation,
} from '../../lib/ai-signal.util';
import {
    AI_LEVER_DISAGREE_KIND,
    AI_LEVER_DISAGREE_TEXT,
    AI_LEVER_DONE_KIND,
    AI_LEVER_DONE_TEXT,
    aiLeverCanMark,
    aiLeverFeedbackObject,
    aiLeverIssuedLine,
    isAiLeverDisagreed,
    isAiLeverDone,
} from '../../lib/ai-lever-done.util';
import { AiFeedbackError } from './AiFeedbackError';
import { AiReadOnlyHint } from './AiReadOnlyHint';

interface AiSignalLeversCellProps {
    /** Bitrix-id менеджера строки — адрес отметки «Сделано». */
    managerId: string;
    recommendations: AiRecommendation[];
}

interface AiLeverDoneProps {
    managerId: string;
    recommendation: AiRecommendation;
}

const LEVER_BUTTON_CLASS = 'h-6 gap-1 px-1.5 text-[0.6875rem]';

/**
 * «Сделано» и «Не согласен» у совета: бэйдж, если совет уже отмечен (в
 * обзоре или только что), иначе две кнопки → реакции recommendation_done
 * и disagree на объект совета — их считает проверка эффекта советов. В
 * режиме «Смотреть как…» кнопки неактивны с подсказкой; ошибка — рядом,
 * повтор — тот же клик.
 */
const AiLeverDone = ({ managerId, recommendation }: AiLeverDoneProps) => {
    const object = aiLeverFeedbackObject(managerId, recommendation);
    const done = useAiFeedback(AI_LEVER_DONE_KIND, object, { managerId });
    const disagree = useAiFeedback(AI_LEVER_DISAGREE_KIND, object, {
        managerId,
    });
    if (isAiLeverDone(recommendation, done.sent)) {
        return (
            <ToneBadge tone="success" variant="soft" size="sm">
                {AI_LEVER_DONE_TEXT.badge}
            </ToneBadge>
        );
    }
    if (isAiLeverDisagreed(disagree.sent)) {
        return (
            <ToneBadge tone="neutral" variant="soft" size="sm">
                {AI_LEVER_DISAGREE_TEXT.badge}
            </ToneBadge>
        );
    }
    const busy = done.disabled || disagree.disabled;
    return (
        <>
            <AiReadOnlyHint hint={done.readOnlyHint}>
                <Button
                    variant="ghost"
                    size="sm"
                    className={LEVER_BUTTON_CLASS}
                    disabled={busy}
                    title={
                        done.readOnlyHint
                            ? undefined
                            : AI_LEVER_DONE_TEXT.buttonTitle
                    }
                    onClick={() => void done.send(AI_LEVER_DONE_KIND)}
                >
                    <Check className="h-3 w-3" />
                    {AI_LEVER_DONE_TEXT.button}
                </Button>
            </AiReadOnlyHint>
            <AiReadOnlyHint hint={disagree.readOnlyHint}>
                <Button
                    variant="ghost"
                    size="sm"
                    className={LEVER_BUTTON_CLASS}
                    disabled={busy}
                    title={
                        disagree.readOnlyHint
                            ? undefined
                            : AI_LEVER_DISAGREE_TEXT.buttonTitle
                    }
                    onClick={() => void disagree.send(AI_LEVER_DISAGREE_KIND)}
                >
                    <ThumbsDown className="h-3 w-3" />
                    {AI_LEVER_DISAGREE_TEXT.button}
                </Button>
            </AiReadOnlyHint>
            <AiFeedbackError
                error={done.error ?? disagree.error}
                className="w-full"
            />
        </>
    );
};

/**
 * Советы строки (топ-3 из снапшота прогноза): бэйдж вида совета с
 * подсказкой (эффект, стоимость, доказательность, опоры, день выдачи),
 * адресат, ожидаемый прирост продаж (без оценки — честно без числа) и
 * отметки «Сделано» / «Не согласен».
 */
export const AiSignalLeversCell = ({
    managerId,
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
                const lever = aiLeverView(recommendation.lever);
                const issued = aiLeverIssuedLine(recommendation);
                return (
                    <li
                        key={`${recommendation.ruleCode}-${index}`}
                        className="flex flex-wrap items-center gap-1"
                    >
                        <HintTooltip
                            title={aiLeverTitle(recommendation, callTypeLabel)}
                            lines={[
                                ...aiLeverHintLines(
                                    recommendation,
                                    callTypeLabel,
                                ),
                                ...(issued ? [issued] : []),
                            ]}
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
                        {aiLeverCanMark(recommendation) && (
                            <AiLeverDone
                                managerId={managerId}
                                recommendation={recommendation}
                            />
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
