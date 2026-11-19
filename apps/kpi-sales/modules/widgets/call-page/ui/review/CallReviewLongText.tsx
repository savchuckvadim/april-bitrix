'use client';

import { useState } from 'react';
import {
    CALL_REVIEW_TEXT,
    callReviewTextPreview,
    isCallReviewTextLong,
} from '@/modules/entities/call-review';

const T = CALL_REVIEW_TEXT.colleagues;

/** Длинный комментарий — свёрнут, «Показать полностью» раскрывает. */
export const CallReviewLongText = ({ text }: { text: string }) => {
    const [open, setOpen] = useState(false);
    const long = isCallReviewTextLong(text);
    return (
        <div className="space-y-1">
            <p className="whitespace-pre-line text-sm">
                {long && !open ? callReviewTextPreview(text) : text}
            </p>
            {long && (
                <button
                    type="button"
                    className="cursor-pointer text-xs text-primary hover:underline"
                    onClick={() => setOpen(value => !value)}
                >
                    {open ? T.collapse : T.showAll}
                </button>
            )}
        </div>
    );
};
