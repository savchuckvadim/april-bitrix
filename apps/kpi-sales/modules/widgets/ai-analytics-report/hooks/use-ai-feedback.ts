'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector, selectIsViewAs } from '@/modules/app';
import {
    aiFeedbackView,
    sendAiFeedback,
    type AiFeedbackChannel,
    type AiFeedbackKind,
} from '@/modules/entities/ai-analytics';

interface UseAiFeedbackOptions {
    managerId?: string | null;
    transcriptionId?: string | null;
}

/**
 * Реакции одного канала на объект витрины: rate — «полезно / не полезно»,
 * disagree — «не согласен», alert_handled — «отработано». Состояние —
 * по ключу канал + объект (aiFeedbackView): подсветка по факту ответа
 * бэка, ошибка у своей кнопки, в режиме «Смотреть как…» кнопки неактивны
 * с подсказкой. Повтор после ошибки — тот же клик.
 */
export const useAiFeedback = (
    channel: AiFeedbackChannel,
    object: string,
    options?: UseAiFeedbackOptions,
) => {
    const dispatch = useAppDispatch();
    const feedback = useAppSelector(state => state.aiAnalytics.feedback);
    const isViewAs = useAppSelector(selectIsViewAs);
    const managerId = options?.managerId ?? undefined;
    const transcriptionId = options?.transcriptionId ?? undefined;

    const send = useCallback(
        (kind: AiFeedbackKind, reason?: string): Promise<boolean> =>
            dispatch(
                sendAiFeedback({
                    kind,
                    object,
                    reason,
                    managerId,
                    transcriptionId,
                }),
            ),
        [dispatch, object, managerId, transcriptionId],
    );

    return {
        ...aiFeedbackView(feedback, channel, object, isViewAs),
        send,
    };
};
