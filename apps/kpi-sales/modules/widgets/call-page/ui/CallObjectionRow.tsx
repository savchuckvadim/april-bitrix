'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import type { StatusTone } from '@workspace/april-ui/tones';
import { cn } from '@workspace/ui/lib/utils';
import type { CallPageObjectionDto } from '@/modules/entities/call-page';
import { objectionReviewTarget } from '../lib/call-review-targets';
import {
    CALL_REVIEW_MARKED_CLASS,
    useCallReviewMarked,
} from '../model/call-review-marks.context';
import { CallShowInTextButton } from './CallShowInTextButton';
import { CallReviewMarkButton } from './review/CallReviewMarkButton';

const LABEL = 'font-medium text-muted-foreground';

interface CallObjectionRowProps {
    objection: CallPageObjectionDto;
    onOpenHighlight: (id: string | null) => void;
}

const handledBadge = (
    handled: boolean | null,
): { tone: StatusTone; text: string } | null => {
    if (handled === null) return null;
    return handled
        ? { tone: 'success', text: 'Отработано' }
        : { tone: 'destructive', text: 'Не отработано' };
};

/**
 * Одно возражение: что сказал клиент, как ответил менеджер, чем
 * закончилось. В режиме руководителя — «Не так»; отмеченное подсвечено.
 */
export const CallObjectionRow = ({
    objection,
    onOpenHighlight,
}: CallObjectionRowProps) => {
    const badge = handledBadge(objection.handled);
    const target = objectionReviewTarget(objection);
    const marked = useCallReviewMarked(target);

    return (
        <li
            className={cn(
                'space-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0',
                marked && CALL_REVIEW_MARKED_CLASS,
            )}
        >
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">
                    {objection.categoryTitle}: {objection.text}
                </h3>
                {badge && (
                    <ToneBadge tone={badge.tone} variant="soft">
                        {badge.text}
                    </ToneBadge>
                )}
                <span className="ml-auto">
                    <CallReviewMarkButton target={target} />
                </span>
            </div>
            {objection.quote && (
                <p className="text-muted-foreground">«{objection.quote}»</p>
            )}
            {objection.handling && (
                <p>
                    <span className={LABEL}>Ответ менеджера: </span>
                    {objection.handling}
                </p>
            )}
            {objection.outcomeTitle && (
                <p>
                    <span className={LABEL}>Чем закончилось: </span>
                    {objection.outcomeTitle}
                </p>
            )}
            <CallShowInTextButton
                highlightId={objection.highlightId}
                onOpen={onOpenHighlight}
            />
        </li>
    );
};
