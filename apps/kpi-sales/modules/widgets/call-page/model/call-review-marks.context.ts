'use client';

import { createContext, useContext } from 'react';
import type { CallReviewItem, CallReviewTarget } from '@/modules/entities/call-review';

/**
 * Отметки «не так» черновика отзыва для кнопок у пунктов разбора. Есть
 * только на личной странице руководителя с правом на отзыв: без провайдера
 * (публичная страница, нет права) кнопок «Не так» нет.
 */
export interface CallReviewMarks {
    /** Замечание к пункту; не отмечен — null. */
    find: (target: CallReviewTarget) => CallReviewItem | null;
    mark: (item: CallReviewItem) => void;
    unmark: (target: CallReviewTarget) => void;
    /** Отмечено 30 пунктов — новые не добавляются. */
    full: boolean;
    /** Идёт сохранение — отметки ждут. */
    disabled: boolean;
}

export const CallReviewMarksContext = createContext<CallReviewMarks | null>(null);

/** Отметки черновика; null — режим руководителя выключен. */
export const useCallReviewMarks = (): CallReviewMarks | null =>
    useContext(CallReviewMarksContext);

/** Пункт отмечен «не так» — подсветить его на странице. */
export const useCallReviewMarked = (target: CallReviewTarget | null): boolean => {
    const marks = useCallReviewMarks();
    return marks !== null && target !== null && marks.find(target) !== null;
};

/** Подсветка отмеченного пункта. Классы — литералами целиком (Tailwind). */
export const CALL_REVIEW_MARKED_CLASS =
    'rounded-md bg-destructive/5 ring-1 ring-destructive/30 ring-offset-4 ring-offset-card';
