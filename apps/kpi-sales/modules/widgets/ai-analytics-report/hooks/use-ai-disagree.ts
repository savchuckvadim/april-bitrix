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
 * него popover закрывается, поля очищаются; ошибка остаётся в popover
 * («Не сохранилось: …»), «Отправить» — повтор. В режиме «Смотреть как…»
 * кнопка неактивна с подсказкой.
 */
export const useAiDisagree = (managerId: string) => {
    const { sent, pending, readOnlyHint, error, send } = useAiFeedback(
        'disagree',
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
        const ok = await send(
            'disagree',
            composeAiDisagreeReason(reasonCode, comment),
        );
        if (ok) {
            setOpen(false);
            setReasonCodeRaw(null);
            setCommentRaw('');
        }
        return ok;
    }, [send, reasonCode, comment]);

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
        /** «Не сохранилось: …» последней отправки; null — ошибки нет. */
        error,
        /** Подсказка режима «Смотреть как…»; null — запись доступна. */
        readOnlyHint,
        /** Кнопка-триггер неактивна: записано, отправляется или режим просмотра. */
        disabled: pending || disagreed || readOnlyHint !== null,
        submit,
    };
};
