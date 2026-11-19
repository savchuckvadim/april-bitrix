'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import type { StatusTone } from '@workspace/april-ui/tones';
import { cn } from '@workspace/ui/lib/utils';
import type { CallPageCheckpointDto } from '@/modules/entities/call-page';
import { checkpointReviewTarget } from '../lib/call-review-targets';
import {
    CALL_REVIEW_MARKED_CLASS,
    useCallReviewMarked,
} from '../model/call-review-marks.context';
import { CallShowInTextButton } from './CallShowInTextButton';
import { CallReviewMarkButton } from './review/CallReviewMarkButton';

interface CallCheckpointRowProps {
    checkpoint: CallPageCheckpointDto;
    onOpenHighlight: (id: string | null) => void;
}

const STATUS_TONE: Record<CallPageCheckpointDto['status'], StatusTone> = {
    done: 'success',
    missed: 'destructive',
    not_applicable: 'muted',
};

/**
 * Пункт методики: статус, название, цитата. В режиме руководителя —
 * «Не так»; отмеченный пункт подсвечен.
 */
export const CallCheckpointRow = ({
    checkpoint,
    onOpenHighlight,
}: CallCheckpointRowProps) => {
    const target = checkpointReviewTarget(checkpoint);
    const marked = useCallReviewMarked(target);

    return (
        <li className={cn('space-y-1', marked && CALL_REVIEW_MARKED_CLASS)}>
            <div className="flex flex-wrap items-center gap-2">
                <ToneBadge
                    size="sm"
                    variant="soft"
                    tone={STATUS_TONE[checkpoint.status]}
                >
                    {checkpoint.statusTitle}
                </ToneBadge>
                <span>{checkpoint.title}</span>
                {checkpoint.mandatory && (
                    <span className="text-xs text-muted-foreground">
                        обязательный
                    </span>
                )}
                <span className="ml-auto">
                    <CallReviewMarkButton target={target} />
                </span>
            </div>
            {checkpoint.quote && (
                <p className="text-muted-foreground">«{checkpoint.quote}»</p>
            )}
            <CallShowInTextButton
                highlightId={checkpoint.highlightId}
                onOpen={onOpenHighlight}
            />
        </li>
    );
};
