import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getDuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { selectMyDepartmentRole } from '@/modules/features/Departament/model/selectors';
import { DuplicatesHelper } from '../lib/api/duplicates-helper';
import { toErrorText } from '../lib/error-text.util';
import { resolveMergeTarget } from '../lib/merge-cards.util';
import { mergeCardsActions } from './MergeCardsSlice';
import type {
    DuplicateCandidate,
    MergeCardsResult,
    SalesHookOperation,
} from './index';

const helper = new DuplicatesHelper();

const initiatorOf = (getState: AppGetState): number =>
    Number(getState().app.bitrix.user?.ID ?? 0);

/** Результат операции хука; failed — исключение с причиной от сервера. */
const resultOf = (operation: SalesHookOperation): MergeCardsResult => {
    const result = (operation.result ?? null) as MergeCardsResult | null;
    if (operation.status === 'failed' || !result) {
        throw new Error(
            operation.error || 'Операция объединения завершилась без результата',
        );
    }
    return result;
};

/**
 * Шаг 1 — план: пробный прогон слияния, в Битрикс ничего не пишется.
 * Права и цель — `resolveMergeTarget` (фронт) и сервер (403).
 */
export const planMergeCards =
    (candidate: DuplicateCandidate) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const target = resolveMergeTarget(
            candidate,
            getDuplicateContext(state),
            selectMyDepartmentRole(state).role,
        );
        if (!domain || !target.allowed) return;

        dispatch(
            mergeCardsActions.planStarted({ entityRefs: target.entityRefs }),
        );
        try {
            const operation = await helper.mergeCards({
                domain,
                entityRefs: target.entityRefs,
                dryRun: true,
                initiatorUserId: initiatorOf(getState),
            });
            dispatch(mergeCardsActions.planned({ plan: resultOf(operation) }));
        } catch (error) {
            dispatch(mergeCardsActions.failed({ message: toErrorText(error) }));
        }
    };

/**
 * Шаг 2 — слияние по подписи плана. Портал изменился между шагами —
 * сервер откажет (409), и руководитель увидит причину, а не сюрприз.
 */
export const executeMergeCards =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const { entityRefs, plan } = state.duplicatesMerge;
        if (!domain || !plan || entityRefs.length < 2) return;

        dispatch(mergeCardsActions.mergeStarted());
        try {
            const operation = await helper.mergeCards({
                domain,
                entityRefs,
                dryRun: false,
                planHash: plan.planHash,
                initiatorUserId: initiatorOf(getState),
            });
            dispatch(mergeCardsActions.merged({ result: resultOf(operation) }));
        } catch (error) {
            dispatch(mergeCardsActions.failed({ message: toErrorText(error) }));
        }
    };
