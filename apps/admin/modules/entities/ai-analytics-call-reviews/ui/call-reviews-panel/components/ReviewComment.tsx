'use client';

import { useState } from 'react';
import { CALL_REVIEWS_DEFAULTS, CALL_REVIEWS_TEXT } from '../../../consts/call-reviews.const';
import { commentPreview } from '../../../lib/call-reviews-format.util';

interface ReviewCommentProps {
    comment: string;
}

/** Комментарий руководителя: первые 300 знаков и «Показать полностью». */
export const ReviewComment = ({ comment }: ReviewCommentProps) => {
    const [expanded, setExpanded] = useState(false);
    const preview = commentPreview(comment, CALL_REVIEWS_DEFAULTS.commentPreview);
    if (preview.text === '') return <span className="text-muted-foreground">—</span>;
    return (
        <div className="max-w-md space-y-1 whitespace-pre-wrap break-words text-sm">
            <div>{expanded ? comment.trim() : preview.text}</div>
            {preview.truncated && (
                <button
                    type="button"
                    className="text-xs text-primary underline-offset-2 hover:underline"
                    onClick={() => setExpanded(prev => !prev)}
                >
                    {expanded ? CALL_REVIEWS_TEXT.showLess : CALL_REVIEWS_TEXT.showFull}
                </button>
            )}
        </div>
    );
};
