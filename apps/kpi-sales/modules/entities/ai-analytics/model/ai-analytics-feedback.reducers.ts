import type { PayloadAction } from '@reduxjs/toolkit';
import { aiFeedbackKey } from '../lib/ai-feedback.util';
import type { AiFeedbackKind } from './index';
import type { AiAnalyticsState } from './ai-analytics-slice';

/*
 * Под-состояние реакций на витрину (feedback) слайса aiAnalytics: тип,
 * пустое значение и case-редьюсеры (спредятся в aiAnalyticsSlice).
 */

/**
 * Реакции на витрину. pending / sent / errors ключуются aiFeedbackKey
 * (канал вида + объект): view по «pulse» не блокирует «пальцы», а
 * «Отработано» по call:<id> не мешает оценке той же строки повестки.
 */
export interface AiFeedbackState {
    /** Ключи реакций, которые сейчас отправляются. */
    pending: string[];
    /** Ключ → последняя записанная реакция (подсветка кнопок; view не пишем). */
    sent: Record<string, AiFeedbackKind>;
    /** Ключ → текст ошибки последней отправки; новая отправка её снимает. */
    errors: Record<string, string>;
    /** Объекты, по которым view-телеметрия уже ушла в этой сессии. */
    viewed: string[];
}

/** Реакция в редьюсерах: вид + объект (ключ считает aiFeedbackKey). */
export interface AiFeedbackTarget {
    kind: AiFeedbackKind;
    object: string;
}

export const emptyAiFeedback = (): AiFeedbackState => ({
    pending: [],
    sent: {},
    errors: {},
    viewed: [],
});

const withoutKey = (keys: string[], key: string): string[] =>
    keys.filter(item => item !== key);

export const aiFeedbackReducers = {
    feedbackSending: (
        state: AiAnalyticsState,
        action: PayloadAction<AiFeedbackTarget>,
    ) => {
        const { kind, object } = action.payload;
        const key = aiFeedbackKey(kind, object);
        if (!state.feedback.pending.includes(key)) {
            state.feedback.pending.push(key);
        }
        delete state.feedback.errors[key];
    },
    feedbackSent: (
        state: AiAnalyticsState,
        action: PayloadAction<AiFeedbackTarget>,
    ) => {
        const { kind, object } = action.payload;
        const key = aiFeedbackKey(kind, object);
        state.feedback.pending = withoutKey(state.feedback.pending, key);
        // view — телеметрия, кнопки по ней не подсвечиваем.
        if (kind !== 'view') state.feedback.sent[key] = kind;
    },
    /** Ошибка ложится на ключ реакции — её видно у той кнопки, что упала. */
    feedbackFailed: (
        state: AiAnalyticsState,
        action: PayloadAction<AiFeedbackTarget & { error: string }>,
    ) => {
        const { kind, object, error } = action.payload;
        const key = aiFeedbackKey(kind, object);
        state.feedback.pending = withoutKey(state.feedback.pending, key);
        state.feedback.errors[key] = error;
    },
    /** Дедуп view-телеметрии на сессию (стор живёт сессию фрейма). */
    markViewed: (state: AiAnalyticsState, action: PayloadAction<string>) => {
        if (!state.feedback.viewed.includes(action.payload)) {
            state.feedback.viewed.push(action.payload);
        }
    },
};
