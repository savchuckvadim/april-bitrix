'use client';

import { FC } from 'react';
import { Merge } from 'lucide-react';
import { Spinner } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { MERGE_CARDS_TEXT } from '../../../lib/merge-cards.util';
import type { MergeCardsView } from '../../../lib/hooks/use-merge-cards';

export interface MergeCardsActionProps {
    view: MergeCardsView;
}

/**
 * «Объединить карточки компаний» — руководителю, для компании-кандидата.
 *
 * Слияние Битрикса необратимо (остаётся самая старая карточка, остальные
 * удаляются), поэтому два шага: план с тем, что останется и что удалится,
 * затем «Объединить безвозвратно». Ничего не пишется до второго клика.
 */
export const MergeCardsAction: FC<MergeCardsActionProps> = ({ view }) => {
    if (!view.allowed) return null;

    if (view.status === 'planning' || view.status === 'merging') {
        return (
            <div className="flex items-center gap-2 rounded-md border border-border p-2 text-sm text-muted-foreground">
                <Spinner />
                {view.status === 'planning'
                    ? MERGE_CARDS_TEXT.planning
                    : MERGE_CARDS_TEXT.merging}
            </div>
        );
    }

    if (view.status === 'done') {
        return (
            <div className="space-y-2 rounded-md border border-success/40 bg-success/5 p-2">
                <p className="text-sm font-semibold text-foreground">
                    {view.result.conflict
                        ? MERGE_CARDS_TEXT.conflict
                        : view.result.survivorId
                          ? MERGE_CARDS_TEXT.done(view.result.survivorId)
                          : MERGE_CARDS_TEXT.nothing}
                </p>
                <Button size="sm" variant="outline" onClick={view.reload}>
                    {MERGE_CARDS_TEXT.reload}
                </Button>
            </div>
        );
    }

    if (view.status === 'planned') {
        return (
            <div className="space-y-2 rounded-md border border-destructive/50 bg-destructive/5 p-2">
                <p className="text-sm font-semibold text-foreground">
                    {MERGE_CARDS_TEXT.planTitle}
                </p>
                {view.plan.lines.map(line => (
                    <p key={line} className="text-xs text-muted-foreground">
                        {line}
                    </p>
                ))}
                <div className="flex items-center gap-2">
                    {view.plan.hasWork && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={view.confirm}
                        >
                            {MERGE_CARDS_TEXT.confirm}
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={view.cancel}>
                        {MERGE_CARDS_TEXT.cancel}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            {view.status === 'error' && view.error && (
                <p className="text-xs text-destructive">{view.error}</p>
            )}
            <p className="text-xs text-muted-foreground">
                {MERGE_CARDS_TEXT.hint}
            </p>
            <Button size="sm" variant="outline" onClick={view.start}>
                <Merge aria-hidden className="size-3.5" />
                {MERGE_CARDS_TEXT.button}
            </Button>
        </div>
    );
};
