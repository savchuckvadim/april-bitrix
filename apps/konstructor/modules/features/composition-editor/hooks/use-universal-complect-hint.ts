'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import type { Composition, CompositionCtx } from '@/modules/entities/composition';
import {
    explainRefsRebuildFailure,
    rebuildRowWithRefs,
    rowSetActions,
    selectRowSetContext,
    type KRow,
} from '@/modules/entities/row-set';
import {
    describeUniversalHint,
    formatUniversalHint,
    universalSwitchTarget,
} from '../lib/universal-hint.util';

/**
 * Универсал: вес наполнения вышел за комплект — подсказка и кнопка «Перейти на
 * <комплект>». Автосмены нет. Переход идёт тем же путём, что смена комплекта в
 * карточке строки (rebuildRowWithRefs), но наполнение остаётся собранным:
 * меняется только комплект. `onSwitched` вызывается после перехода (окно
 * наполнения закрывается: его черновик уже записан в строку).
 */
export const useUniversalComplectHint = (
    row: KRow | null,
    composition: Composition | null,
    ctx: CompositionCtx | null,
    onSwitched?: () => void,
) => {
    const dispatch = useAppDispatch();
    const context = useAppSelector(selectRowSetContext);
    const hint = useMemo(
        () => (composition && ctx ? describeUniversalHint(composition, ctx) : null),
        [composition, ctx],
    );
    const target = hint ? universalSwitchTarget(hint) : null;

    const switchComplect = () => {
        if (!row || !ctx || !target) return;
        const next = { complectCode: target.code };
        const rebuilt = rebuildRowWithRefs(ctx.catalog, context, row, next, { keepComposition: true });
        if (!rebuilt) {
            toast.error(explainRefsRebuildFailure(ctx.catalog, context, row, next));
            return;
        }
        dispatch(rowSetActions.upsertRow(rebuilt));
        onSwitched?.();
    };

    return {
        hint,
        text: hint ? formatUniversalHint(hint) : null,
        target,
        switchComplect,
    };
};
