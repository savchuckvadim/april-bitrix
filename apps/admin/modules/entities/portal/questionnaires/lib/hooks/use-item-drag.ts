'use client';

import { useCallback, useState } from 'react';
import type { DragEvent } from 'react';

/**
 * Перетаскивание вопросов мышью.
 *
 * Порядок вопросов — это то, что видит менеджер, поэтому его меняют
 * перетаскиванием, а не полем «сортировка». Клавиатура остаётся
 * равноправной: на карточке есть стрелки «выше/ниже», и они зовут тот же
 * `reorder` — drag-and-drop без клавиатурной пары был бы недоступен тем,
 * кто мышью не работает.
 *
 * Тащить можно только за ручку: карточка вопроса полна полей ввода, а
 * `draggable` на всей карточке отнял бы у них выделение текста мышью —
 * попытка выделить слово начинала бы перетаскивание.
 */
export const useItemDrag = (reorder: (from: number, to: number) => void) => {
    const [handleIndex, setHandleIndex] = useState<number | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    /** Карточка становится перетаскиваемой, пока зажата её ручка. */
    const handleProps = useCallback(
        (index: number) => ({
            onMouseDown: () => setHandleIndex(index),
            onMouseUp: () => setHandleIndex(null),
        }),
        [],
    );

    const onDragStart = useCallback(
        (index: number) => (event: DragEvent<HTMLElement>) => {
            setDragIndex(index);
            // Без данных Firefox перетаскивание вовсе не начинает.
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(index));
        },
        [],
    );

    const onDragOver = useCallback(
        (index: number) => (event: DragEvent<HTMLElement>) => {
            // preventDefault здесь и есть разрешение «сюда можно бросить».
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            setOverIndex(index);
        },
        [],
    );

    const onDrop = useCallback(
        (index: number) => (event: DragEvent<HTMLElement>) => {
            event.preventDefault();
            const from = dragIndex;
            setDragIndex(null);
            setOverIndex(null);
            setHandleIndex(null);
            if (from === null || from === index) return;
            reorder(from, index);
        },
        [dragIndex, reorder],
    );

    const onDragEnd = useCallback(() => {
        setDragIndex(null);
        setOverIndex(null);
        setHandleIndex(null);
    }, []);

    return {
        dragIndex,
        overIndex,
        /** Карточку тащат только за ручку. */
        isDraggable: (index: number) => handleIndex === index,
        handleProps,
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
    };
};
