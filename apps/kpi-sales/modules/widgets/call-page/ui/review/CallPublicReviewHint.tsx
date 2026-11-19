import { CALL_REVIEW_TEXT } from '@/modules/entities/call-review/lib/call-review.texts';

/** Тонкая строка под шапкой публичной страницы: где оценить разбор. */
export const CallPublicReviewHint = () => (
    <p className="rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
        {CALL_REVIEW_TEXT.publicHint}
    </p>
);
