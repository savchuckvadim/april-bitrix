'use client';

import { Check, Save } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { CALL_REVIEW_TEXT, formatCallReviewMoment } from '@/modules/entities/call-review';
import type { CallReviewSaveState } from '../../model/use-call-lead-review';

const T = CALL_REVIEW_TEXT.save;

interface CallReviewSaveBarProps {
    save: CallReviewSaveState;
    /** Когда сохранён мой отзыв, ISO; не сохранял — null. */
    savedAt: string | null;
    /** Сохранённый отзыв есть и черновик от него не отличается — сохранять нечего. */
    unchanged: boolean;
    onSave: () => void;
}

/** «Сохранить» и итог: «Сохранено», текст ошибки или когда сохранён отзыв. */
export const CallReviewSaveBar = ({
    save,
    savedAt,
    unchanged,
    onSave,
}: CallReviewSaveBarProps) => {
    const saving = save.status === 'saving';
    const when = formatCallReviewMoment(savedAt);
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" disabled={saving || unchanged} onClick={onSave}>
                <Save aria-hidden />
                {saving ? T.saving : T.button}
            </Button>
            {save.status === 'saved' && (
                <span className="inline-flex items-center gap-1 text-sm text-success" role="status">
                    <Check aria-hidden className="size-4" />
                    {T.saved}
                </span>
            )}
            {save.status === 'error' && (
                <span className="text-sm text-destructive" role="alert">
                    {save.message}
                </span>
            )}
            {save.status !== 'error' && when && (
                <span className="text-xs text-muted-foreground">{T.savedAt(when)}</span>
            )}
        </div>
    );
};
