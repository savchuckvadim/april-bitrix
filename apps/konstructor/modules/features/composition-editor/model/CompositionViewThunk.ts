import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { CompositionViewHelper } from '../lib/api/composition-view-helper';
import {
    readStoredCompositionView,
    storeCompositionView,
} from '../lib/composition-view-storage.util';
import {
    compositionViewActions,
    selectCompositionView,
    selectCompositionViewOwner,
    type WithCompositionView,
} from './CompositionViewSlice';
import type { CompositionViewSettings } from './types';

const helper = new CompositionViewHelper();

type CompositionViewThunkAction = ThunkAction<
    Promise<void>,
    WithCompositionView,
    undefined,
    UnknownAction
>;

/**
 * Вид пользователя при старте: сразу копия из браузера, затем сервер — выбор
 * могли сменить на другом компьютере. Если пока шёл запрос пользователь
 * переключил вид сам, его выбор новее ответа сервера. Без владельца в сеть не
 * ходим: настройка только в браузере.
 */
export const fetchCompositionView = (): CompositionViewThunkAction => async (dispatch, getState) => {
    const owner = selectCompositionViewOwner(getState());

    const stored = readStoredCompositionView(owner);
    if (stored) dispatch(compositionViewActions.set(stored));
    if (!owner) return;
    const before = selectCompositionView(getState());

    const saved = await helper.read(owner.domain, owner.bxUserId);
    if (!saved || selectCompositionView(getState()) !== before) return;
    storeCompositionView(owner, saved);
    dispatch(compositionViewActions.set(saved));
};

/**
 * Смена вида: экран и копия в браузере — сразу, сервер — следом. Настройка не
 * критична: сбой записи не откатывает выбор, в этом браузере он сохранится.
 */
export const updateCompositionView =
    (patch: Partial<CompositionViewSettings>): CompositionViewThunkAction =>
    async (dispatch, getState) => {
        const next = { ...selectCompositionView(getState()), ...patch };
        dispatch(compositionViewActions.set(next));
        const owner = selectCompositionViewOwner(getState());
        storeCompositionView(owner, next);
        if (!owner) return;
        try {
            await helper.write(owner.domain, owner.bxUserId, next);
        } catch (error) {
            console.warn('Вид наполнения не сохранён на сервере', error);
        }
    };
