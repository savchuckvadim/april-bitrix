'use client';

import * as React from 'react';

export interface BxPickerItem {
    id: string;
    label: string;
    sublabel?: string;
}

interface BxPickerListProps {
    items: BxPickerItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isLoading?: boolean;
    emptyText?: string;
}

/**
 * Reusable scrollable picker list for Bitrix entity selection dialogs.
 */
export function BxPickerList({
    items,
    selectedId,
    onSelect,
    isLoading = false,
    emptyText = 'Ничего не найдено.',
}: BxPickerListProps) {
    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground py-2">
                Загрузка данных из Битрикса…
            </p>
        );
    }

    if (items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-2">{emptyText}</p>
        );
    }

    return (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={[
                        'w-full text-left px-3 py-2 rounded border text-sm transition-colors',
                        selectedId === item.id
                            ? 'border-primary bg-primary/10'
                            : 'border-transparent hover:bg-muted',
                    ].join(' ')}
                >
                    <span className="font-medium">{item.label}</span>
                    {item.sublabel && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            {item.sublabel}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
