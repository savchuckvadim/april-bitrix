'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { cn } from '@workspace/ui/lib/utils';
import {
    formatScore,
    highlightIdOf,
    scoreTone,
    type CallPageSectionDto,
} from '@/modules/entities/call-page';
import { sectionReviewTarget } from '../lib/call-review-targets';
import {
    CALL_REVIEW_MARKED_CLASS,
    useCallReviewMarked,
} from '../model/call-review-marks.context';
import { CallShowInTextButton } from './CallShowInTextButton';
import { CallReviewMarkButton } from './review/CallReviewMarkButton';

const LABEL = 'font-medium text-muted-foreground';

interface CallSectionRowProps {
    section: CallPageSectionDto;
    /** id элемента на странице — к нему прокручивает сводка оценок. */
    anchorId: string;
    onOpenHighlight: (id: string | null) => void;
}

/**
 * Один раздел разговора: оценка, разбор, «как было» и «как стоило». Цитата
 * «как было» нашлась в расшифровке — есть переход к месту в разговоре. В
 * режиме руководителя — «Не так»; отмеченный раздел подсвечен.
 */
export const CallSectionRow = ({
    section,
    anchorId,
    onOpenHighlight,
}: CallSectionRowProps) => {
    const target = sectionReviewTarget(section);
    const marked = useCallReviewMarked(target);

    return (
        <li
            id={anchorId}
            className={cn(
                'scroll-mt-4 space-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0',
                marked && CALL_REVIEW_MARKED_CLASS,
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{section.title}</h3>
                <div className="flex shrink-0 items-center gap-2">
                    <CallReviewMarkButton target={target} />
                    {section.score !== null && (
                        <ToneBadge tone={scoreTone(section.score)} variant="soft">
                            {formatScore(section.score)} из 10
                        </ToneBadge>
                    )}
                </div>
            </div>
            {section.analysis && <p>{section.analysis}</p>}
            {section.asWas && (
                <p>
                    <span className={LABEL}>Как было: </span>
                    {section.asWas}
                </p>
            )}
            {section.weaknesses && (
                <p>
                    <span className={LABEL}>Что слабо: </span>
                    {section.weaknesses}
                </p>
            )}
            {section.advice && (
                <p>
                    <span className={LABEL}>Как стоило: </span>
                    {section.advice}
                </p>
            )}
            {section.alternatives.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                    {section.alternatives.map(item => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
            <CallShowInTextButton
                highlightId={highlightIdOf(section)}
                onOpen={onOpenHighlight}
            />
        </li>
    );
};
