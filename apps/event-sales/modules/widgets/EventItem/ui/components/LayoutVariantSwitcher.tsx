'use client';

import { FC } from 'react';
import { PanelRight, Columns2, NotebookPen } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { ItemLayoutVariant } from '../../lib/hooks/use-item-layout-variant';

const OPTIONS: {
    value: ItemLayoutVariant;
    title: string;
    Icon: typeof PanelRight;
}[] = [
    { value: 'sticky', title: 'Отчёт + липкий План', Icon: PanelRight },
    { value: 'grid', title: 'Сетка 50/50', Icon: Columns2 },
    { value: 'focus', title: 'Фокус на комментарии', Icon: NotebookPen },
];

/** Сегмент-переключатель варианта отображения формы (full-режим). */
export const LayoutVariantSwitcher: FC<{
    value: ItemLayoutVariant;
    onChange: (v: ItemLayoutVariant) => void;
}> = ({ value, onChange }) => (
    <div className="flex items-center rounded-md border border-border p-0.5">
        {OPTIONS.map(({ value: v, title, Icon }) => (
            <button
                key={v}
                type="button"
                title={title}
                onClick={() => onChange(v)}
                className={cn(
                    'cursor-pointer rounded-sm p-1.5 transition',
                    value === v
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                )}
            >
                <Icon size={16} />
            </button>
        ))}
    </div>
);
