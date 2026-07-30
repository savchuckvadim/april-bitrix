'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { cn } from '@workspace/ui/lib/utils';

export interface VirtualListProps<T> {
    items: T[];
    /**
     * Рендер одной строки. Динамическая высота (раскрывающиеся строки)
     * поддерживается из коробки — обёртка измеряется measureElement.
     */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** Оценка высоты строки в px до первого измерения (default 56). */
    estimateSize?: number;
    /** Сколько строк рендерить за пределами вьюпорта (default 8). */
    overscan?: number;
    /** Стабильный ключ строки — обязателен при переупорядочивании данных. */
    getItemKey?: (item: T, index: number) => React.Key;
    /**
     * Классы СКРОЛЛ-КОНТЕЙНЕРА: высота обязательна снаружи
     * (например `max-h-[700px]`), иначе виртуализировать нечего.
     */
    className?: string;
    /**
     * Sticky-шапка внутри скролл-контейнера: рендерится до строк,
     * стилизуйте её `sticky top-0 z-10 bg-…` на своей стороне.
     */
    header?: React.ReactNode;
    /** Контент после строк (итоги, «пусто»). Не виртуализируется. */
    footer?: React.ReactNode;
}

/**
 * Виртуализированный список на @tanstack/react-virtual: в DOM живут только
 * видимые строки (+overscan) — сотни/тысячи строк перестают строить и
 * перекладывать гигантский DOM.
 *
 * Табличная разметка: HTML `<table>` с виртуализацией не дружит — строки
 * позиционируются absolute. Рендерьте строки grid/flex-разметкой с
 * фиксированным шаблоном колонок и такой же шапкой в `header`.
 *
 * ВАЖНО: агрегаты/экспорт считайте по полному массиву данных, а не по
 * отрендеренным строкам — виртуализация влияет только на DOM.
 */
export function VirtualList<T>({
    items,
    renderItem,
    estimateSize = 56,
    overscan = 8,
    getItemKey,
    className,
    header,
    footer,
}: VirtualListProps<T>) {
    const parentRef = React.useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan,
        getItemKey: getItemKey
            ? index => getItemKey(items[index] as T, index)
            : undefined,
    });

    return (
        <div ref={parentRef} className={cn('relative overflow-auto', className)}>
            {header}
            <div
                style={{
                    height: virtualizer.getTotalSize(),
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map(virtualRow => (
                    <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        {renderItem(items[virtualRow.index] as T, virtualRow.index)}
                    </div>
                ))}
            </div>
            {footer}
        </div>
    );
}
