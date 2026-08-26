'use client';

import { FC } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useDateDraft } from '../lib/hooks/use-date-draft';
import type { XvostDateView } from '../lib/hooks/use-xvost-fields';

/** Одна дата хвоста: подпись и `<input type=date>` с коммитом по blur. */
export const XvostDateRow: FC<{ date: XvostDateView }> = ({ date }) => {
    const draft = useDateDraft(date.value, date.setValue);

    return (
        <div className="min-w-0 space-y-1">
            <Label className="block max-w-full text-xs text-muted-foreground">
                <span title={date.label} className="block truncate">
                    {date.label}
                </span>
            </Label>
            <Input
                type="date"
                value={draft.value}
                onChange={e => draft.onChange(e.target.value)}
                onBlur={draft.onBlur}
                className="h-7 max-w-44 text-xs"
            />
        </div>
    );
};
