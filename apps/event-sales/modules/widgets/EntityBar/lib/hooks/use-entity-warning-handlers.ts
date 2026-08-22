'use client';

import { useMemo } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { searchDuplicates } from '@/modules/features/Duplicates';
import { innActions } from '@/modules/features/Inn';
import type { EntityWarningActionId } from './use-entity-warnings';

/**
 * Обработчики действий предупреждений шапки (та самая карта, обещанная в
 * use-entity-warnings). Реализованные действия попадают в карту, остальные
 * предупреждения EntityWarnings рисует текстом без кнопки.
 */
export const useEntityWarningHandlers = (): Partial<
    Record<EntityWarningActionId, () => void>
> => {
    const dispatch = useAppDispatch();

    return useMemo(
        () => ({
            // Ручной формы поиска больше нет: ИНН заводится в саму сущность,
            // а действие предупреждения просто перезапускает поиск по тому,
            // что уже известно о клиенте.
            'check-duplicates-inn': () =>
                dispatch(searchDuplicates({ force: true })),
            // Раскрывает микро-редактор ИНН в клиентской строке шапки.
            'fill-inn': () =>
                dispatch(innActions.setEditorOpen({ isOpen: true })),
        }),
        [dispatch],
    );
};
