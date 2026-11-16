'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

export interface VariantTileLoadingProps {
    /** Вариант, открытый сейчас, — рамка та же, что у готовой плитки */
    selected: boolean;
}

/**
 * Плитка варианта, пока его название и стадия идут из Битрикса: сам вариант
 * уже известен, поэтому место занято сразу и экран не прыгает.
 */
export const VariantTileLoading = ({ selected }: VariantTileLoadingProps) => (
    <div
        aria-busy="true"
        aria-label="Вариант загружается"
        className={cn(
            'flex min-h-28 flex-col gap-3 rounded-xl border bg-card p-4',
            selected ? 'border-primary' : 'border-border',
        )}
    >
        <div className="flex items-center justify-between">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
            <span className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <span className="h-4 w-2/3 animate-pulse rounded bg-muted" />
    </div>
);
