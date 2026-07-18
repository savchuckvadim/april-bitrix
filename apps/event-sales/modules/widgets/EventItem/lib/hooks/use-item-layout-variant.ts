'use client';

import { useEffect, useState } from 'react';

/**
 * Вариант отображения формы отчёта в full-режиме (timeline):
 * - sticky — отчёт слева, липкое План-саммари справа;
 * - grid   — сетка 50/50, контакт и компания в левой (Report) части;
 * - focus  — большой комментарий как главный редактор, остальное
 *            компактным рейлом справа.
 * Выбор пользователя персистится (паттерн ui-scale/color-scheme).
 */
export type ItemLayoutVariant = 'sticky' | 'grid' | 'focus';
export const ITEM_LAYOUT_VARIANTS = ['sticky', 'grid', 'focus'] as const;

const STORAGE_KEY = 'event-item-layout';

export const useItemLayoutVariant = () => {
    const [variant, setVariant] = useState<ItemLayoutVariant>('sticky');

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ItemLayoutVariant;
        if (stored && ITEM_LAYOUT_VARIANTS.includes(stored)) {
            setVariant(stored);
        }
    }, []);

    const set = (next: ItemLayoutVariant) => {
        setVariant(next);
        localStorage.setItem(STORAGE_KEY, next);
    };

    return [variant, set] as const;
};
