import { Bitrix } from '@workspace/bitrix';
import type { BXUser } from '@workspace/bx';

type BitrixStartUser = Parameters<typeof Bitrix.start>[1];
import {
    IS_PROD,
    TESTING_DOMAIN,
    TESTING_USER,
} from '../../consts/app-global';
import { appActions } from '../../model/AppSlice';
import { AppDispatch, initWSClient } from '../../model/store';

/** Код ошибки инициализации «не во фрейме Bitrix в PROD». */
export const NON_AUTH_ERROR = 'nonauth';

/**
 * Boot-последовательность (Alfacentr-паттерн: тонкий thunk + этот util).
 * `Bitrix.start` прозрачен: во фрейме — реальные domain/user, вне фрейма —
 * переданные TESTING_*. В PROD вне фрейма — nonauth-экран.
 * Дальнейшие загрузки (структура отделов → фильтр → отчёт) — через
 * listeners, реагирующие на setAppData; этот util о них не знает.
 */
export const appInit = async (
    dispatch: AppDispatch,
    // _getState: AppGetState,
) => {
    const bitrix = await Bitrix.start(
        TESTING_DOMAIN,
        TESTING_USER as unknown as BitrixStartUser,
    );
    const {
        domain: authDomain,
        user: authUser,
        inFrame,
    } = bitrix.api.getInitializedData();

    if (!inFrame && IS_PROD) {
        dispatch(
            appActions.setInitializedError({ errorMessage: NON_AUTH_ERROR }),
        );
        return;
    }

    const domain = authDomain || TESTING_DOMAIN;
    const user = (authUser ?? TESTING_USER) as unknown as BXUser;

    if (!inFrame) {
        console.info(`app-init: вне фрейма Bitrix — dev-режим (${domain})`);
    }

    // WS-коннект к kpi-report-sales (события user-report ловит listener).
    initWSClient(Number(user.ID), domain);

    // Триггер для listeners (department → filter → report, user-report WS).
    dispatch(appActions.setAppData({ domain, user }));
};
