'use client';

import { ChevronRight } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { cn } from '@workspace/ui/lib/utils';
import type { CompositionSectionItem } from '../lib/composition-sections.util';
import { CompositionCheckbox } from './CompositionCheckbox';

export interface CompositionSectionBlockProps {
    title: string;
    total: number;
    checkedCount: number;
    isOpen: boolean;
    visibleItems: CompositionSectionItem[];
    isChecked: (code: string) => boolean;
    onToggleOpen: () => void;
    onToggleItem: (code: string, next: boolean) => void;
}

/**
 * Категория наполнения: заголовок со счётчиком «отмечено из всего».
 * Раскрыта — все пункты, свёрнута — только отмеченные.
 */
export const CompositionSectionBlock = ({
    title,
    total,
    checkedCount,
    isOpen,
    visibleItems,
    isChecked,
    onToggleOpen,
    onToggleItem,
}: CompositionSectionBlockProps) => (
    <section className="rounded-lg border">
        <button
            type="button"
            onClick={onToggleOpen}
            aria-expanded={isOpen}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <ChevronRight
                aria-hidden
                className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    isOpen && 'rotate-90',
                )}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {title}
            </span>
            <ToneBadge tone={checkedCount ? 'complect' : 'muted'} variant="soft">
                {checkedCount} из {total}
            </ToneBadge>
        </button>
        {visibleItems.length ? (
            <div className="grid gap-x-2 border-t px-1 py-1 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-4">
                {visibleItems.map(item => (
                    <CompositionCheckbox
                        key={item.code}
                        name={item.name}
                        checked={isChecked(item.code)}
                        onToggle={next => onToggleItem(item.code, next)}
                    />
                ))}
            </div>
        ) : null}
    </section>
);
