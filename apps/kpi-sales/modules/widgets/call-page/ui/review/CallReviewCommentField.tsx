'use client';

import { Textarea } from '@workspace/ui/components/textarea';
import {
    CALL_REVIEW_LIMITS,
    CALL_REVIEW_TEXT,
    callReviewCounter,
} from '@/modules/entities/call-review';

const T = CALL_REVIEW_TEXT.comment;
const FIELD_ID = 'call-review-comment';

interface CallReviewCommentFieldProps {
    value: string;
    onChange: (comment: string) => void;
}

/** Большой комментарий — до 20 000 знаков, счётчик ближе к пределу. */
export const CallReviewCommentField = ({ value, onChange }: CallReviewCommentFieldProps) => {
    const counter = callReviewCounter(value.length, CALL_REVIEW_LIMITS.comment);
    return (
        <div className="space-y-1">
            <label htmlFor={FIELD_ID} className="text-sm font-medium">
                {T.label}
            </label>
            <Textarea
                id={FIELD_ID}
                value={value}
                onChange={event => onChange(event.target.value)}
                maxLength={CALL_REVIEW_LIMITS.comment}
                placeholder={T.placeholder}
                className="min-h-32 text-sm"
            />
            {counter && (
                <p className="text-right text-[0.6875rem] text-muted-foreground tabular-nums">
                    {counter}
                </p>
            )}
        </div>
    );
};
