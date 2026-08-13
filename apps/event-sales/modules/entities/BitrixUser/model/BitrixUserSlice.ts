import {
    createSlice,
    type ActionCreatorWithPayload,
    type ActionCreatorWithoutPayload,
    type PayloadAction,
    type Reducer,
} from '@reduxjs/toolkit';
import type { PortalUser } from '../lib/user-view';

/**
 * Справочник сотрудников портала — те, кого нет в загруженной структуре
 * отдела продаж.
 *
 * Структура отдела приезжает с бэка и содержит только ОП. Любой, кто работает
 * вне его (руководитель, админ, сотрудник другого подразделения), в истории
 * подписывался «Сотрудник 447»: имя было негде взять. Здесь оно доспрашивается
 * у портала по id и живёт до перезагрузки приложения.
 */
export interface BitrixUserState {
    byId: Record<number, PortalUser>;
    /** id, по которым запрос уже уходил — второй раз не спрашиваем. */
    requestedIds: number[];
}

const initialState: BitrixUserState = { byId: {}, requestedIds: [] };

const bitrixUserSlice = createSlice({
    name: 'bitrixUser',
    initialState,
    reducers: {
        markRequested(state, action: PayloadAction<{ ids: number[] }>) {
            state.requestedIds.push(...action.payload.ids);
        },
        setUsers(state, action: PayloadAction<{ users: PortalUser[] }>) {
            for (const user of action.payload.users) {
                state.byId[user.id] = user;
            }
        },
        /** Полный сброс: reloadApp перезапрашивает всё заново. */
        reset: () => initialState,
    },
});

/* Экспорты аннотированы явно — TS2742 (immer из pnpm-пути). */
export const bitrixUserActions: {
    markRequested: ActionCreatorWithPayload<
        { ids: number[] },
        'bitrixUser/markRequested'
    >;
    setUsers: ActionCreatorWithPayload<
        { users: PortalUser[] },
        'bitrixUser/setUsers'
    >;
    reset: ActionCreatorWithoutPayload<'bitrixUser/reset'>;
} = bitrixUserSlice.actions;

export const bitrixUserReducer: Reducer<BitrixUserState> =
    bitrixUserSlice.reducer;
