'use client';

import { useCallback, useMemo, useReducer, useState } from 'react';
import {
    CALL_REVIEW_TEXT,
    callReviewBodyOf,
    callReviewDraftOf,
    callReviewDraftReducer,
    canAddCallReviewItem,
    findCallReviewItem,
    isCallReviewDraftChanged,
    saveCallReview,
    type CallReviewDraftAction,
    type CallReviewView,
} from '@/modules/entities/call-review';
import type { CallReviewMarks } from './call-review-marks.context';

/** Состояние сохранения: ждём правок, сохраняем, сохранено, ошибка. */
export type CallReviewSaveState =
    | { status: 'idle' }
    | { status: 'saving' }
    | { status: 'saved' }
    | { status: 'error'; message: string };

interface UseCallLeadReviewArgs {
    token: string;
    lead: string;
    initial: CallReviewView;
}

/**
 * Блок «Оценка руководителя»: черновик отзыва (чистый редьюсер сущности),
 * отметки «не так» для кнопок у пунктов разбора и сохранение через наш
 * route handler. После сохранения блок берёт ответ сервера (свой отзыв и
 * отзывы коллег), черновик — сохранённый отзыв. Любая правка гасит
 * «Сохранено».
 */
export const useCallLeadReview = ({ token, lead, initial }: UseCallLeadReviewArgs) => {
    const [view, setView] = useState(initial);
    const [draft, dispatch] = useReducer(
        callReviewDraftReducer,
        initial.mine,
        callReviewDraftOf,
    );
    const [save, setSave] = useState<CallReviewSaveState>({ status: 'idle' });
    const saving = save.status === 'saving';

    const edit = useCallback((action: CallReviewDraftAction) => {
        dispatch(action);
        setSave(current => (current.status === 'saved' ? { status: 'idle' } : current));
    }, []);

    const marks = useMemo<CallReviewMarks | null>(
        () =>
            view.viewer.canReview
                ? {
                      find: target => findCallReviewItem(draft, target),
                      mark: item => edit({ type: 'mark', item }),
                      unmark: target => edit({ type: 'unmark', target }),
                      full: !canAddCallReviewItem(draft),
                      disabled: saving,
                  }
                : null,
        [view.viewer.canReview, draft, edit, saving],
    );

    const submit = useCallback(async () => {
        const body = callReviewBodyOf(draft);
        if (body === null) {
            setSave({ status: 'error', message: CALL_REVIEW_TEXT.save.chooseAgree });
            return;
        }
        setSave({ status: 'saving' });
        const result = await saveCallReview(token, lead, body);
        if (!result.ok) {
            setSave({ status: 'error', message: result.message });
            return;
        }
        setView(result.view);
        dispatch({ type: 'reset', review: result.view.mine });
        setSave({ status: 'saved' });
    }, [draft, token, lead]);

    return {
        view,
        draft,
        edit,
        marks,
        save,
        submit,
        changed: isCallReviewDraftChanged(draft, view.mine),
    };
};

export type CallLeadReviewState = ReturnType<typeof useCallLeadReview>;
