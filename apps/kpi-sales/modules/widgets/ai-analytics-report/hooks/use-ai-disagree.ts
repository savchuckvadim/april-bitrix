'use client';

import { useCallback, useState } from 'react';
import type { MicroSelectOption } from '@workspace/april-ui';
import { AI_FEEDBACK_OBJECT } from '@/modules/entities/ai-analytics';
import {
    AI_DISAGREE_REASONS,
    aiDisagreeCommentMax,
    clampAiDisagreeComment,
    composeAiDisagreeReason,
    formatAiDisagreeCommentCounter,
    isAiDisagreeReasonCode,
    type AiDisagreeReasonCode,
} from '../lib/ai-signal.util';
import { useAiFeedback } from './use-ai-feedback';

const REASON_OPTIONS: MicroSelectOption[] = AI_DISAGREE_REASONS.map(reason => ({
    value: reason.code,
    label: reason.label,
}));

/**
 * «Не согласен» со строкой обзора: popover с причиной из списка и
 * необязательным комментарием — в feedback уходят одной строкой reason
 * («Подпись: комментарий», ≤ 300 символов, комментарий подрезается под
 * выбранную подпись). Успех — по факту ответа бэка (feedback.sent), после
 * него popover закрывается, поля очищаются.
 */
export const useAiDisagree = (managerId: string) => {
    const { sent, pending, markDisagree } = useAiFeedback(
        AI_FEEDBACK_OBJECT.managerRow(managerId),
        { managerId },
    );
    const [open, setOpen] = useState(false);
    const [reasonCode, setReasonCodeRaw] =
        useState<AiDisagreeReasonCode | null>(null);
    const [comment, setCommentRaw] = useState('');

    const disagreed = sent === 'disagree';

    const setReasonCode = useCallback((value: string) => {
        const code = isAiDisagreeReasonCode(value) ? value : null;
        setReasonCodeRaw(code);
        setCommentRaw(prev => clampAiDisagreeComment(code, prev));
    }, []);

    const setComment = useCallback(
        (value: string) =>
            setCommentRaw(clampAiDisagreeComment(reasonCode, value)),
        [reasonCode],
    );

    const submit = useCallback(async () => {
        const ok = await markDisagree(
            composeAiDisagreeReason(reasonCode, comment),
        );
        if (ok) {
            setOpen(false);
            setReasonCodeRaw(null);
            setCommentRaw('');
        }
        return ok;
    }, [markDisagree, reasonCode, comment]);

    return {
        open,
        setOpen,
        reasonOptions: REASON_OPTIONS,
        reasonCode,
        setReasonCode,
        comment,
        setComment,
        commentMax: aiDisagreeCommentMax(reasonCode),
        counter: formatAiDisagreeCommentCounter(reasonCode, comment),
        pending,
        disagreed,
        /** Кнопка-триггер неактивна: реакция уже записана или отправляется. */
        disabled: pending || disagreed,
        submit,
    };
};
