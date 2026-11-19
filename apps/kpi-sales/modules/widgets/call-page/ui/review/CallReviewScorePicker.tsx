'use client';

import { TONE_SOLID } from '@workspace/april-ui/tones';
import { cn } from '@workspace/ui/lib/utils';
import { scoreTone } from '@/modules/entities/call-page';
import { CALL_REVIEW_LIMITS, CALL_REVIEW_TEXT } from '@/modules/entities/call-review';

const T = CALL_REVIEW_TEXT.score;

const SCORES = Array.from(
    { length: CALL_REVIEW_LIMITS.scoreMax - CALL_REVIEW_LIMITS.scoreMin + 1 },
    (_, index) => CALL_REVIEW_LIMITS.scoreMin + index,
);

interface CallReviewScorePickerProps {
    value: number | null;
    onChange: (score: number | null) => void;
}

/**
 * «Ваша оценка» 1–10 — все десять видно сразу, выбранная залита цветом
 * оценки (как на витрине); повторное нажатие или «Без оценки» — сброс.
 */
export const CallReviewScorePicker = ({ value, onChange }: CallReviewScorePickerProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{T.label}</span>
        <span className="text-xs text-muted-foreground">{T.hint}</span>
        <div role="radiogroup" aria-label={T.label} className="flex flex-wrap gap-1">
            {SCORES.map(score => {
                const current = score === value;
                return (
                    <button
                        key={score}
                        type="button"
                        role="radio"
                        aria-checked={current}
                        onClick={() => onChange(current ? null : score)}
                        className={cn(
                            'size-7 cursor-pointer rounded-md border text-xs tabular-nums transition-colors',
                            current
                                ? cn('border-transparent font-semibold', TONE_SOLID[scoreTone(score)])
                                : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {score}
                    </button>
                );
            })}
        </div>
        {value !== null && (
            <button
                type="button"
                className="cursor-pointer text-xs text-muted-foreground hover:underline"
                onClick={() => onChange(null)}
            >
                {T.clear}
            </button>
        )}
    </div>
);
