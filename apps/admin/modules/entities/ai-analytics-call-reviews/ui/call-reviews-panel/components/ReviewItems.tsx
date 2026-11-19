'use client';

import type { CallReviewItem } from '../../../model';

interface ReviewItemsProps {
    items: CallReviewItem[];
}

/** Замечания «не так»: вид словами, подпись пункта и что не так. */
export const ReviewItems = ({ items }: ReviewItemsProps) => {
    if (items.length === 0) return <span className="text-muted-foreground">—</span>;
    return (
        <ul className="max-w-sm space-y-1 text-sm">
            {items.map((item, index) => (
                <li key={`${item.kind}:${item.label}:${index}`} className="break-words">
                    <span className="text-muted-foreground">{item.kindTitle}:</span> {item.label}
                    {item.comment && <span className="text-muted-foreground"> — {item.comment}</span>}
                </li>
            ))}
        </ul>
    );
};
