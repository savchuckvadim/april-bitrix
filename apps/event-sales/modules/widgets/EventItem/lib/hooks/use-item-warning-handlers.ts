'use client';

import { useMemo } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { duplicatesActions } from '@/modules/features/Duplicates';
import { innActions } from '@/modules/features/Inn';
import type { ItemWarningActionId } from './use-item-warnings';

/**
 * Обработчики действий предупреждений шапки (та самая карта, обещанная в
 * use-item-warnings). Реализованные действия попадают в карту, остальные
 * предупреждения ItemWarnings рисует текстом без кнопки.
 */
export const useItemWarningHandlers = (): Partial<
    Record<ItemWarningActionId, () => void>
> => {
    const dispatch = useAppDispatch();

    return useMemo(
        () => ({
            // Открывает ручную форму поиска дублей (панель «Сигналы» в правой
            // колонке отчёта) — там поле ИНН.
            'check-duplicates-inn': () =>
                dispatch(duplicatesActions.manualToggled({ isOpen: true })),
            // Раскрывает микро-редактор ИНН под предупреждениями шапки.
            'fill-inn': () =>
                dispatch(innActions.setEditorOpen({ isOpen: true })),
        }),
        [dispatch],
    );
};
