'use client';

import * as React from 'react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { cn } from '@workspace/ui/lib/utils';
import {
    CALL_PAGE_BADGE_TONE,
    CALL_PAGE_SEGMENT_CLASS,
    CALL_PAGE_SPEAKER_TITLE,
    formatClock,
    type CallPageHighlightDto,
    type CallPageSegmentDto,
    type CallPageTone,
} from '@/modules/entities/call-page';

interface CallTranscriptSegmentProps {
    segment: CallPageSegmentDto;
    /** Окраска подсветки; null — реплика не выделена. */
    tone: CallPageTone | null;
    /** Подсветки, которые начинаются с этой реплики. */
    labels: readonly CallPageHighlightDto[];
    /** Реплика звучит сейчас. */
    playing: boolean;
    /** К реплике нужно прокрутить расшифровку. */
    focused: boolean;
    /** Можно ли слушать с этой реплики. */
    playable: boolean;
    onOpen: (segment: CallPageSegmentDto) => void;
}

/** Одна реплика расшифровки: время, кто говорит, текст и подписи подсветок. */
export const CallTranscriptSegment = ({
    segment,
    tone,
    labels,
    playing,
    focused,
    playable,
    onOpen,
}: CallTranscriptSegmentProps) => {
    const ref = React.useRef<HTMLLIElement>(null);

    React.useEffect(() => {
        if (focused) {
            ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [focused]);

    return (
        <li
            ref={ref}
            className={cn(
                'rounded-r-md border-l-2 border-l-transparent px-2 py-1.5 transition-colors',
                tone && CALL_PAGE_SEGMENT_CLASS[tone],
                playing && !tone && 'bg-muted',
            )}
        >
            {labels.length > 0 && (
                <div className="mb-1 flex flex-wrap gap-1">
                    {labels.map(label => (
                        <ToneBadge
                            key={label.id}
                            size="sm"
                            variant="soft"
                            tone={CALL_PAGE_BADGE_TONE[label.tone]}
                            title={label.note ?? undefined}
                        >
                            {label.label}
                        </ToneBadge>
                    ))}
                </div>
            )}
            <div className="flex items-baseline gap-2 text-sm">
                {segment.startSec !== null &&
                    (playable ? (
                        <button
                            type="button"
                            className="w-10 shrink-0 cursor-pointer text-left font-mono text-xs text-primary hover:underline"
                            title="Слушать с этого места"
                            onClick={() => onOpen(segment)}
                        >
                            {formatClock(segment.startSec)}
                        </button>
                    ) : (
                        <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                            {formatClock(segment.startSec)}
                        </span>
                    ))}
                <p className="min-w-0">
                    {segment.speaker && (
                        <span className="mr-1 font-medium text-muted-foreground">
                            {CALL_PAGE_SPEAKER_TITLE[segment.speaker]}:
                        </span>
                    )}
                    {segment.text}
                </p>
            </div>
        </li>
    );
};
