import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';

export interface TaskLeadLinksState {
    /** Отмеченные лиды — уедут в plan.relatedLeadIds (L_* новой задачи). */
    selectedIds: number[];
    /** Менеджер уже трогал набор — предвыбор больше не вмешивается. */
    isTouched: boolean;
}

const initialState: TaskLeadLinksState = { selectedIds: [], isTouched: false };

/**
 * Выбор заявок/лидов для НОВОЙ задачи (создаётся из сделки/компании без
 * текущей задачи): отмеченные попадают в UF_CRM_TASK как L_{id} — путь
 * заявки не рвётся при работе из воронки менеджера.
 */
const taskLeadLinksSlice = createSlice({
    name: 'taskLeadLinks',
    initialState,
    reducers: {
        toggle(state, action: PayloadAction<number>) {
            const id = action.payload;
            state.selectedIds = state.selectedIds.includes(id)
                ? state.selectedIds.filter(item => item !== id)
                : [...state.selectedIds, id];
            state.isTouched = true;
        },
        /**
         * Предвыбор по умолчанию: связь с заявкой нужна почти всегда, и
         * пустые чекбоксы менеджер чаще пролистывал, чем отмечал. Ручной
         * выбор не трогаем — только пока к набору не притрагивались.
         */
        preselect(state, action: PayloadAction<number[]>) {
            if (state.isTouched) return;
            state.selectedIds = action.payload;
        },
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const taskLeadLinksActions: {
    toggle: ActionCreatorWithPayload<number, 'taskLeadLinks/toggle'>;
    preselect: ActionCreatorWithPayload<number[], 'taskLeadLinks/preselect'>;
    reset: ActionCreatorWithoutPayload<'taskLeadLinks/reset'>;
} = taskLeadLinksSlice.actions;

export const taskLeadLinksReducer: Reducer<TaskLeadLinksState> =
    taskLeadLinksSlice.reducer;
