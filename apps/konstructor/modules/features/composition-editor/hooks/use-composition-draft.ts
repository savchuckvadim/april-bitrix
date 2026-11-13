'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch } from '@/modules/app';
import { rowSetActions, type KRow } from '@/modules/entities/row-set';

type Composition = NonNullable<KRow['composition']>;

/**
 * Черновик наполнения для окна: правки живут в окне и уходят в сборку только
 * по «Сохранить». Пока черновик не сохранён, строки таблицы не пересобираются —
 * строка пакета LT с весом 0 не исчезает вместе с окном, которое из неё открыто.
 * Окно монтируется только открытым, поэтому исходный состав — состав при
 * монтировании; `prepare` правит его один раз (например, добавляет пустой пакет).
 */
export const useCompositionDraft = (
    row: KRow,
    prepare?: (composition: Composition) => Composition,
) => {
    const dispatch = useAppDispatch();
    const [initial] = useState(() =>
        row.composition && prepare ? prepare(row.composition) : row.composition,
    );
    const [draft, setDraft] = useState(initial);
    const draftRow = useMemo<KRow>(() => ({ ...row, composition: draft }), [row, draft]);

    return {
        /** Строка с составом черновика — для редактора и превью */
        row: draftRow,
        write: (next: Composition) => setDraft(next),
        /** Черновик отличается от состава при открытии */
        changed: draft !== initial,
        save: () => {
            if (!draft) return;
            dispatch(
                rowSetActions.setRowComposition({
                    setId: row.setId,
                    key: row.key,
                    composition: draft,
                }),
            );
        },
    };
};
