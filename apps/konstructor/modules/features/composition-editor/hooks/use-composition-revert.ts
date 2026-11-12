'use client';

import { useRef } from 'react';
import { useAppDispatch } from '@/modules/app';
import { rowSetActions, type KRow } from '@/modules/entities/row-set';

/**
 * Окно наполнения: правки видны сразу (цены за ними пересчитываются), а
 * «Отменить» возвращает состав на момент открытия окна. Окно монтируется
 * только открытым, поэтому исходный состав — это состав при монтировании.
 */
export const useCompositionRevert = (row: KRow) => {
    const dispatch = useAppDispatch();
    const initial = useRef(row.composition);

    return {
        changed: row.composition !== initial.current,
        revert: () => {
            if (!initial.current) return;
            dispatch(
                rowSetActions.setRowComposition({
                    setId: row.setId,
                    key: row.key,
                    composition: initial.current,
                }),
            );
        },
    };
};
