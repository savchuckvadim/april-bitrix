'use client';

import { ChevronRight } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { cn } from '@workspace/ui/lib/utils';
import type {
    CompositionSectionItemView,
    CompositionSectionView,
} from '../lib/composition-sections.util';
import type { WeightMarkKind } from '../model/types';
import { CompositionCheckbox } from './CompositionCheckbox';
import { WeightMark } from './WeightMark';

export interface CompositionSectionBlockProps {
    section: CompositionSectionView & {
        isOpen: boolean;
        visibleItems: CompositionSectionItemView[];
    };
    markKind: WeightMarkKind;
    onToggleOpen: () => void;
    onToggleItem: (code: string, next: boolean) => void;
}

/**
 * Категория наполнения: заголовок со счётчиком «отмечено из всего».
 * Раскрыта — все пункты, свёрнута — только отмеченные.
 */
export const CompositionSectionBlock = ({
    section,
    markKind,
    onToggleOpen,
    onToggleItem,
}: CompositionSectionBlockProps) => (
    <section className="rounded-lg border">
        <button
            type="button"
            onClick={onToggleOpen}
            aria-expanded={section.isOpen}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <ChevronRight
                aria-hidden
                className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    section.isOpen && 'rotate-90',
                )}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {section.title}
            </span>
            <ToneBadge tone={section.checkedItems.length ? 'complect' : 'muted'} variant="soft">
                {section.checkedItems.length} из {section.items.length}
            </ToneBadge>
        </button>
        {section.visibleItems.length ? (
            <div className="grid gap-x-2 border-t px-1 py-1 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-4">
                {section.visibleItems.map(item => (
                    <CompositionCheckbox
                        key={item.code}
                        name={item.name}
                        checked={item.checked}
                        onToggle={next => onToggleItem(item.code, next)}
                        mark={<WeightMark value={item.mark} kind={markKind} />}
                    />
                ))}
            </div>
        ) : null}
    </section>
);
