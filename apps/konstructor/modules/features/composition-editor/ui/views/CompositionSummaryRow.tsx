'use client';

import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import type {
    CompositionSectionItemView,
    CompositionSectionView,
} from '../../lib/composition-sections.util';
import { CompositionCheckbox } from '../CompositionCheckbox';
import type { CompositionItemProps } from './composition-item-props';

export interface CompositionSummaryRowProps {
    section: CompositionSectionView;
    /** Под текстом категории: полоса пакетов у Legal Tech */
    extra?: ReactNode;
    itemProps: (item: CompositionSectionItemView) => CompositionItemProps;
}

/** Категория строкой: что выбрано текстом, вес, правка блоков — в поповере. */
export const CompositionSummaryRow = ({ section, extra, itemProps }: CompositionSummaryRowProps) => {
    const restCount = section.items.length - section.checkedItems.length;

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b px-2 py-3 last:border-b-0 md:grid-cols-[14rem_minmax(0,1fr)_2.5rem_2rem]">
            <div className="text-sm font-semibold">{section.title}</div>
            <div className="col-span-2 row-start-2 flex flex-col gap-2 text-sm text-foreground/80 md:col-span-1 md:col-start-2 md:row-start-1">
                <div>
                    {section.checkedItems.map(item => item.name).join(', ') || 'Ничего не выбрано'}
                    {restCount && section.checkedItems.length ? (
                        <span className="text-muted-foreground"> · ещё {restCount} можно добавить</span>
                    ) : null}
                </div>
                {extra}
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
                        <CompositionCheckbox key={item.code} {...itemProps(item)} />
                    ))}
                </PopoverContent>
            </Popover>
        </div>
    );
};
