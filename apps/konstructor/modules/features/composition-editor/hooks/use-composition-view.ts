'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import { isCompositionViewMode } from '../lib/composition-view.util';
import { selectCompositionView } from '../model/CompositionViewSlice';
import { updateCompositionView } from '../model/CompositionViewThunk';
import { WEIGHT_MARK_BY_VIEW } from '../model/types';

/** Вид наполнения пользователя: какой выбран, какая у него метка веса, смена. */
export const useCompositionView = () => {
    const dispatch = useAppDispatch();
    const { mode, showWeights } = useAppSelector(selectCompositionView);

    return {
        mode,
        showWeights,
        markKind: WEIGHT_MARK_BY_VIEW[mode],
        setMode: (next: string) => {
            if (isCompositionViewMode(next)) void dispatch(updateCompositionView({ mode: next }));
        },
        toggleWeights: () => void dispatch(updateCompositionView({ showWeights: !showWeights })),
    };
};
