'use client';

import { useCallback, useMemo } from 'react';
import { ENTITY_LISTS } from '../constants/entity-lists';
import type { ProcessConfig } from '../types';

interface UseEntityListsInput {
    config: ProcessConfig;
    onChange: (lists: Record<string, string[]>) => void;
}

/**
 * Правка списков стадий и статусов.
 *
 * Состав по умолчанию берётся из констант, а правки живут в конфигурации рядом
 * с ответами на вопросы — значит переживают переход между страницами и попадают
 * в печатный регламент. Пока группу не трогали, её в конфигурации нет вовсе:
 * так видно, что человек согласился с составом по умолчанию, а не собрал
 * такой же руками.
 */
export const useEntityLists = ({ config, onChange }: UseEntityListsInput) => {
    // Стабильная ссылка: иначе каждый рендер пересоздаёт все колбэки.
    const stored = useMemo(() => config.lists ?? {}, [config.lists]);

    const itemsOf = useCallback(
        (groupId: string): string[] => {
            if (stored[groupId]) return stored[groupId];

            const group = ENTITY_LISTS.flatMap(column => column.groups).find(
                item => item.id === groupId,
            );

            return group?.items ?? [];
        },
        [stored],
    );

    const isEdited = useCallback(
        (groupId: string): boolean => Boolean(stored[groupId]),
        [stored],
    );

    const setItems = useCallback(
        (groupId: string, items: string[]) => {
            onChange({ ...stored, [groupId]: items });
        },
        [onChange, stored],
    );

    const add = useCallback(
        (groupId: string, value: string) => {
            const text = value.trim();
            if (!text) return;

            const current = itemsOf(groupId);
            if (current.includes(text)) return;

            setItems(groupId, [...current, text]);
        },
        [itemsOf, setItems],
    );

    const remove = useCallback(
        (groupId: string, value: string) => {
            setItems(
                groupId,
                itemsOf(groupId).filter(item => item !== value),
            );
        },
        [itemsOf, setItems],
    );

    /** Вернуть группе состав по умолчанию — убрав правку из конфигурации. */
    const reset = useCallback(
        (groupId: string) => {
            const next = { ...stored };
            delete next[groupId];
            onChange(next);
        },
        [onChange, stored],
    );

    return { columns: ENTITY_LISTS, itemsOf, isEdited, add, remove, reset };
};
