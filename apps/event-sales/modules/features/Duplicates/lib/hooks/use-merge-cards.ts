'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getDuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { reloadApp } from '@/modules/app/model/thunk/AppThunk';
import { selectMyDepartmentRole } from '@/modules/features/Departament/model/selectors';
import { mergeCardsActions } from '../../model/MergeCardsSlice';
import {
    executeMergeCards,
    planMergeCards,
} from '../../model/MergeCardsThunk';
import type { DuplicateCandidate } from '../../model';
import { mergePlanView, resolveMergeTarget } from '../merge-cards.util';

/**
 * «Объединить карточки» в окне кандидата: готовые флаги, тексты плана и
 * колбэки — компонент только рисует.
 */
export function useMergeCards(candidate: DuplicateCandidate | undefined) {
    const dispatch = useAppDispatch();
    const context = useAppSelector(getDuplicateContext);
    const role = useAppSelector(selectMyDepartmentRole).role;
    const state = useAppSelector(s => s.duplicatesMerge);
    const target = resolveMergeTarget(candidate, context, role);

    return {
        allowed: target.allowed,
        status: state.status,
        error: state.error,
        plan: mergePlanView(state.plan),
        result: mergePlanView(state.result),
        /** Шаг 1: построить план (ничего не пишет). */
        start: () => {
            if (candidate) dispatch(planMergeCards(candidate));
        },
        confirm: () => dispatch(executeMergeCards()),
        cancel: () => dispatch(mergeCardsActions.cancelled()),
        reload: () => dispatch(reloadApp()),
    };
}

export type MergeCardsView = ReturnType<typeof useMergeCards>;
