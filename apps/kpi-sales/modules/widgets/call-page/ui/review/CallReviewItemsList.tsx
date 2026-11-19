'use client';

import { X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    CALL_REVIEW_KIND_TEXT,
    CALL_REVIEW_TEXT,
    type CallReviewItem,
} from '@/modules/entities/call-review';

const T = CALL_REVIEW_TEXT.items;

interface CallReviewItemsListProps {
    items: CallReviewItem[];
    /** Убрать замечание; не задан — список только для чтения. */
    onRemove?: (item: CallReviewItem) => void;
    /** Подсказка, когда пусто; не задана — пустой список не рисуется. */
    emptyText?: string;
}

/** Отмеченные «не так» пункты с замечаниями: вид пункта, подпись, что не так. */
export const CallReviewItemsList = ({
    items,
    onRemove,
    emptyText,
}: CallReviewItemsListProps) => {
    if (items.length === 0) {
        return emptyText ? (
            <p className="text-xs text-muted-foreground">{emptyText}</p>
        ) : null;
    }
    return (
        <ul className="space-y-2">
            {items.map(item => (
                <li
                    key={`${item.kind}-${item.ref}`}
                    className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm"
                >
                    <div className="min-w-0 flex-1 space-y-0.5">
                        <p>
                            <span className="text-xs text-muted-foreground">
                                {CALL_REVIEW_KIND_TEXT[item.kind]}:{' '}
                            </span>
                            <span className="font-medium">{item.label || item.ref}</span>
                        </p>
                        {item.comment && (
                            <p className="whitespace-pre-line text-muted-foreground">
                                {item.comment}
                            </p>
                        )}
                    </div>
                    {onRemove && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 shrink-0 gap-1 px-2 text-xs"
                            onClick={() => onRemove(item)}
                        >
                            <X aria-hidden className="size-3" />
                            {T.remove}
                        </Button>
                    )}
                </li>
            ))}
        </ul>
    );
};
