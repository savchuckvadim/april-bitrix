'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    sendAiFeedback,
    type AiFeedbackKind,
} from '@/modules/entities/ai-analytics';

interface UseAiFeedbackOptions {
    managerId?: string | null;
    transcriptionId?: string | null;
}

/**
 * Реакции на объект витрины (pulse / agenda / call:<id> / attention:… /
 * overview:<id>): «полезно», «не полезно», «не согласен», «отработано».
 * Возвращает готовые флаги и колбэки; успех показывается по факту ответа
 * бэка (feedback.sent).
 */
export const useAiFeedback = (
    object: string,
    options?: UseAiFeedbackOptions,
) => {
    const dispatch = useAppDispatch();
    const sent = useAppSelector(
        state => state.aiAnalytics.feedback.sent[object],
    );
    const pending = useAppSelector(state =>
        state.aiAnalytics.feedback.pending.includes(object),
    );

    const send = useCallback(
        (kind: AiFeedbackKind, reason?: string) =>
            dispatch(
                sendAiFeedback({
                    kind,
                    object,
                    reason,
                    managerId: options?.managerId ?? undefined,
                    transcriptionId: options?.transcriptionId ?? undefined,
                }),
            ),
        [dispatch, object, options?.managerId, options?.transcriptionId],
    );

    return {
        sent: sent ?? null,
        pending,
        markUseful: () => send('useful'),
        markNotUseful: () => send('not_useful'),
        markDisagree: (reason?: string) => send('disagree', reason),
        markHandled: () => send('alert_handled'),
    };
};
