'use client';

import { Pencil } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import type { CompositionSectionView } from '../../lib/composition-sections.util';
import type { WeightMarkKind } from '../../model/types';
import { CompositionCheckbox } from '../CompositionCheckbox';
import { WeightMark } from '../WeightMark';

export interface CompositionSummaryRowProps {
    section: CompositionSectionView;
    markKind: WeightMarkKind;
    onToggleItem: (code: string, next: boolean) => void;
}

/** Категория строкой: что выбрано текстом, вес, правка блоков — в поповере. */
export const CompositionSummaryRow = ({
    section,
    markKind,
    onToggleItem,
}: CompositionSummaryRowProps) => {
    const restCount = section.items.length - section.checkedItems.length;

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b px-2 py-3 last:border-b-0 md:grid-cols-[14rem_minmax(0,1fr)_2.5rem_2rem]">
            <div className="text-sm font-semibold">{section.title}</div>
            <div className="col-span-2 row-start-2 text-sm text-foreground/80 md:col-span-1 md:col-start-2 md:row-start-1">
                {section.checkedItems.map(item => item.name).join(', ') || 'Ничего не выбрано'}
                {restCount && section.checkedItems.length ? (
                    <span className="text-muted-foreground"> · ещё {restCount} можно добавить</span>
                ) : null}
            </div>
            <div className="hidden text-right text-xs text-muted-foreground tabular-nums md:block">
                {section.weight}
            </div>
            <Popover>
                <PopoverTrigger
                    aria-label={`Изменить: ${section.title}`}
                    className="col-start-2 row-start-1 inline-flex size-8 cursor-pointer items-center justify-center self-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:col-start-4"
                >
                    <Pencil aria-hidden className="size-3.5" />
                </PopoverTrigger>
                <PopoverContent align="end" className="max-h-96 w-[28rem] max-w-[90vw] overflow-y-auto p-1">
                    {section.items.map(item => (
                        <CompositionCheckbox
                            key={item.code}
                            name={item.name}
                            checked={item.checked}
                            onToggle={next => onToggleItem(item.code, next)}
                            mark={<WeightMark value={item.mark} kind={markKind} />}
                        />
                    ))}
                </PopoverContent>
            </Popover>
        </div>
    );
};
