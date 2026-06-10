'use client';

import { useMemo } from 'react';
import { Tag } from './TagItem';

export const Tags = ({ tags }: { tags: string }) => {
    const tagsArray = useMemo(
        () =>
            (tags ?? '')
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        [tags],
    );

    const shown = tagsArray.length > 10 ? tagsArray.slice(0, 10) : tagsArray;

    return (
        <div className="flex flex-wrap items-baseline gap-1 pt-1">
            <span className="w-full text-xs font-medium text-muted-foreground sm:w-auto">Теги:</span>
            <div className="flex flex-wrap gap-1">
                {shown.map((tag, i) => (
                    <Tag key={`${tag}-${i}`} tag={tag} variantIndex={i} />
                ))}
                {tagsArray.length > 10 && <span className="text-xs text-muted-foreground">…</span>}
            </div>
        </div>
    );
};
