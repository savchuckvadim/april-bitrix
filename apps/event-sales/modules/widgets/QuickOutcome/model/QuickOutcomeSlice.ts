import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { QuickOutcomeKind } from '../lib/quick-outcome';

/** Что вернуть в форму, если окно итога закрыли без отправки. */
export interface QuickOutcomeRestore {
    workStatusId: number;
    isPlanActive: boolean;
}

export interface QuickOutcomeOpened {
    kind: QuickOutcomeKind;
    /** На кого записывается итог — ответственный сделки (или сам нажавший). */
    ownerId: number;
    restore: QuickOutcomeRestore;
}

export interface QuickOutcomeState {
    /**
     * Какой итог записывается; null — быстрого итога нет.
     *
     * Держится дольше самого окна: пока отчёт не ушёл окончательно, от
     * него зависит пометка «кто записал итог за ответственного» — она
     * нужна и повторной отправке после ошибки.
     */
    kind: QuickOutcomeKind | null;
    /** Окно на экране. Гаснет, как только отчёт ушёл на экран финиша. */
    isOpen: boolean;
    /**
     * На кого записывается итог. Хранится здесь, а не только в отделе:
     * перечитанный отдел ставит ответственным текущего пользователя, и
     * итог нужно вернуть на ответственного сделки (см. syncActingFromTask).
     */
    ownerId: number | null;
    restore: QuickOutcomeRestore | null;
}

const initialState: QuickOutcomeState = {
    kind: null,
    isOpen: false,
    ownerId: null,
    restore: null,
};

/**
 * Быстрый итог («Продажа» / «Отказ»). Сам отчёт живёт в общих слайсах
 * формы — здесь только режим, видимость окна и то, что нужно вернуть при
 * отмене.
 *
 * В каталог сбросов на обновление приложения НЕ входит — как и остальная
 * форма отчёта: обновление не должно терять заполняемый итог.
 */
const quickOutcomeSlice = createSlice({
    name: 'quickOutcome',
    initialState,
    reducers: {
        opened(state, action: PayloadAction<QuickOutcomeOpened>) {
            state.kind = action.payload.kind;
            state.isOpen = true;
            state.ownerId = action.payload.ownerId;
            state.restore = action.payload.restore;
        },
        /** Отчёт ушёл: окно убрано, режим ещё действует (см. `kind`). */
        hidden(state) {
            state.isOpen = false;
        },
        /** Конец быстрого итога: отменили, отправили или открыли другое дело. */
        closed: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const quickOutcomeActions: {
    opened: ActionCreatorWithPayload<QuickOutcomeOpened, 'quickOutcome/opened'>;
    hidden: ActionCreatorWithoutPayload<'quickOutcome/hidden'>;
    closed: ActionCreatorWithoutPayload<'quickOutcome/closed'>;
} = quickOutcomeSlice.actions;

export const quickOutcomeReducer: Reducer<QuickOutcomeState> =
    quickOutcomeSlice.reducer;
