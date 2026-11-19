'use client';

import { useCallback, useState } from 'react';
import {
    CALL_REVIEW_LIMITS,
    callReviewCounter,
    type CallReviewTarget,
} from '@/modules/entities/call-review';
import { useCallReviewMarks } from './call-review-marks.context';

/**
 * Кнопка «Не так» у пункта разбора: окно с полем «Что не так», добавить
 * замечание в черновик, поменять или убрать. Окно открывается с уже
 * записанным замечанием пункта. Без режима руководителя — available false.
 */
export const useCallReviewMark = (target: CallReviewTarget | null) => {
    const marks = useCallReviewMarks();
    const [open, setOpenState] = useState(false);
    const [comment, setCommentState] = useState('');
    const marked = marks !== null && target !== null ? marks.find(target) : null;

    const setOpen = useCallback(
        (next: boolean) => {
            if (next) setCommentState(marked?.comment ?? '');
            setOpenState(next);
        },
        [marked],
    );

    const setComment = useCallback(
        (value: string) =>
            setCommentState(value.slice(0, CALL_REVIEW_LIMITS.itemComment)),
        [],
    );

    const apply = useCallback(() => {
        if (marks === null || target === null) return;
        marks.mark({ ...target, comment });
        setOpenState(false);
    }, [marks, target, comment]);

    const remove = useCallback(() => {
        if (marks === null || target === null) return;
        marks.unmark(target);
        setOpenState(false);
    }, [marks, target]);

    return {
        available: marks !== null && target !== null,
        marked: marked !== null,
        open,
        setOpen,
        comment,
        setComment,
        counter: callReviewCounter(comment.length, CALL_REVIEW_LIMITS.itemComment),
        /** Новый пункт не поместится (уже 30); отмеченный менять можно. */
        full: marked === null && (marks?.full ?? false),
        disabled: marks?.disabled ?? true,
        apply,
        remove,
    };
};
