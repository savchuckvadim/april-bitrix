'use client';

import { useCallback, useState } from 'react';
import {
    AI_FEEDBACK_OBJECT,
    clampAiDisagreeReason,
    formatAiDisagreeCounter,
    normalizeAiDisagreeReason,
} from '@/modules/entities/ai-analytics';
import { useAiFeedback } from './use-ai-feedback';

/**
 * «Не согласен» со строкой обзора: popover с необязательной причиной
 * (≤ 300 символов). Возвращает состояние popover, поле причины со
 * счётчиком и отправку; успех — по факту ответа бэка (feedback.sent),
 * после него popover закрывается, поле очищается.
 */
export const useAiDisagree = (managerId: string) => {
    const { sent, pending, markDisagree } = useAiFeedback(
        AI_FEEDBACK_OBJECT.managerRow(managerId),
        { managerId },
    );
    const [open, setOpen] = useState(false);
    const [reason, setReasonRaw] = useState('');

    const disagreed = sent === 'disagree';

    const setReason = useCallback(
        (value: string) => setReasonRaw(clampAiDisagreeReason(value)),
        [],
    );

    const submit = useCallback(async () => {
        const ok = await markDisagree(normalizeAiDisagreeReason(reason));
        if (ok) {
            setOpen(false);
            setReasonRaw('');
        }
        return ok;
    }, [markDisagree, reason]);

    return {
        open,
        setOpen,
        reason,
        setReason,
        counter: formatAiDisagreeCounter(reason),
        pending,
        disagreed,
        /** Кнопка-триггер неактивна: реакция уже записана или отправляется. */
        disabled: pending || disagreed,
        submit,
    };
};
