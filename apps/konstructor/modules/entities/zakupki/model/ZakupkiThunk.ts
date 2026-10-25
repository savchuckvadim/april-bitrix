import type { AppThunk } from '@/modules/app/model/store';
import { saveSnapshot } from '../../snapshot';
import { ZakupkiHelper } from '../lib/api/zakupki-helper';
import { buildZakupkiRequest, zakupkiRequestBlocker } from '../lib/build-zakupki-request';
import type { ZakupkiSettingsSave } from './dto';
import { zakupkiActions } from './ZakupkiSlice';

const helper = new ZakupkiHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

const actor = (state: { app: { domain: string; bitrix: { user: { ID?: number | string } | null } } }) => {
    const userId = Number(state.app.bitrix.user?.ID);
    return state.app.domain && userId > 0 ? { domain: state.app.domain, bxUserId: userId } : null;
};

/** Настройки «3 КП» пользователя на домене (свои → портала → дефолт создаётся бэком). */
export const fetchZakupkiSettings = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const who = actor(getState());
    if (!who) return;
    dispatch(zakupkiActions.loading());
    try {
        dispatch(zakupkiActions.loaded(await helper.fetch(who.domain, who.bxUserId)));
    } catch (error) {
        dispatch(zakupkiActions.failed(errorText(error, 'настройки «3 КП» не загружены')));
    }
};

/**
 * Сохранить правки: `user` — свои настройки (поверх портальных),
 * `default` — настройки портала для всех. Бэк возвращает действующую запись.
 */
export const saveZakupkiSettings =
    (scope: 'user' | 'default'): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const state = getState();
        const who = actor(state);
        if (!who) return false;
        const dto: ZakupkiSettingsSave = {
            ...who,
            values: Object.entries(state.zakupki.draft).map(([code, value]) => ({ code, value })),
        };
        dispatch(zakupkiActions.saving(true));
        try {
            const saved = scope === 'user' ? await helper.saveUser(dto) : await helper.saveDefault(dto);
            dispatch(zakupkiActions.loaded(saved));
            return true;
        } catch (error) {
            dispatch(zakupkiActions.saveFailed(errorText(error, 'настройки не сохранены')));
            return false;
        }
    };

/** Снять свои настройки — снова портальные. */
export const resetZakupkiSettings = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const who = actor(getState());
    if (!who) return;
    dispatch(zakupkiActions.saving(true));
    try {
        await helper.deleteUser(who.domain, who.bxUserId);
        await dispatch(fetchZakupkiSettings());
    } catch (error) {
        dispatch(zakupkiActions.saveFailed(errorText(error, 'не удалось сбросить настройки')));
    }
};

/**
 * «Сформировать 3 КП»: слепок → очередь zakupki-offer/create; документы
 * уходят в таймлайн сделки сами (ручки статуса нет — как в легаси).
 */
export const generateZakupkiOffer = (): AppThunk<Promise<boolean>> => async (dispatch, getState) => {
    const state = getState();
    const blocker = zakupkiRequestBlocker(state);
    const request = blocker ? null : buildZakupkiRequest(state);
    if (!request) {
        dispatch(zakupkiActions.generateFailed(blocker ?? 'Нет договора или поставки главной строки'));
        return false;
    }
    dispatch(zakupkiActions.generateStarted());
    try {
        await dispatch(saveSnapshot());
        const operationId = await helper.generate(request);
        dispatch(zakupkiActions.generateDone(operationId || null));
        return true;
    } catch (error) {
        dispatch(zakupkiActions.generateFailed(errorText(error, '«3 КП» не сформированы')));
        return false;
    }
};
