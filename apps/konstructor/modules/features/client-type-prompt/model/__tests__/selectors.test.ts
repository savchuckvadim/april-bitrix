import { describe, expect, it } from 'vitest';
import { appActions } from '@/modules/app/model/AppSlice';
import type { AppStore } from '@/modules/app/model/store';
import { RQ_TYPE } from '@/modules/entities/bx-rq/model/types';
import {
    COMPANY_FIELD_KEY,
    ITEM_BITRIX_ID,
    dealData,
    loadDeal,
    loadPortal,
    loadRequisites,
    makePortal,
    makePromptStore,
} from '../../lib/__fixtures__/prompt-store';
import { clientTypePromptActions } from '../ClientTypePromptSlice';
import {
    selectClientTypeDetectReady,
    selectClientTypePromptOptions,
    selectClientTypePromptVisible,
} from '../selectors';

/** Сделка, портал и реквизиты загружены, автоопределение отработало, типа клиента нет. */
const readyStore = (portal = makePortal()): AppStore => {
    const { store } = makePromptStore();
    loadDeal(store);
    loadPortal(store, portal);
    loadRequisites(store, []);
    store.dispatch(clientTypePromptActions.detectStarted());
    store.dispatch(clientTypePromptActions.detectFinished());
    return store;
};

describe('окно «Укажите тип клиента»: когда показывать', () => {
    it('всё загружено, тип неизвестен — показывать', () => {
        const store = readyStore();
        expect(selectClientTypeDetectReady(store.getState())).toBe(true);
        expect(selectClientTypePromptVisible(store.getState())).toBe(true);
    });

    it('автоопределение ещё не отработало — не показывать', () => {
        const { store } = makePromptStore();
        loadDeal(store);
        loadPortal(store, makePortal());
        loadRequisites(store, []);

        expect(selectClientTypeDetectReady(store.getState())).toBe(true);
        expect(selectClientTypePromptVisible(store.getState())).toBe(false);
    });

    it('реквизиты ещё не загружены — готовности нет, окна нет', () => {
        const { store } = makePromptStore();
        loadDeal(store);
        loadPortal(store, makePortal());

        expect(selectClientTypeDetectReady(store.getState())).toBe(false);
        expect(selectClientTypePromptVisible(store.getState())).toBe(false);
    });

    it('тип клиента записан в компанию — не показывать', () => {
        const store = readyStore();
        store.dispatch(
            appActions.patchCompany({ [COMPANY_FIELD_KEY]: ITEM_BITRIX_ID.ip }),
        );

        expect(selectClientTypePromptVisible(store.getState())).toBe(false);
    });

    it('тип клиента задан в сделке — не показывать', () => {
        const { store } = makePromptStore();
        loadDeal(store, {
            deal: { UF_CRM_OP_CLIENT_TYPE_D: String(ITEM_BITRIX_ID.state) },
        });
        loadPortal(store, makePortal());
        loadRequisites(store, []);
        store.dispatch(clientTypePromptActions.detectFinished());

        expect(selectClientTypePromptVisible(store.getState())).toBe(false);
    });

    it('поля «Тип клиента» нет на портале — не показывать', () => {
        const store = readyStore(makePortal({ withoutField: true }));

        expect(selectClientTypePromptVisible(store.getState())).toBe(false);
    });

    it('«Позже» скрывает окно', () => {
        const store = readyStore();
        store.dispatch(clientTypePromptActions.deferred());

        expect(selectClientTypePromptVisible(store.getState())).toBe(false);
    });

    it('повторная загрузка сделки (⟳) сохраняет «Позже» и запускает автоопределение заново', () => {
        const store = readyStore();
        store.dispatch(clientTypePromptActions.deferred());
        store.dispatch(appActions.setAppData(dealData()));

        const state = store.getState().clientTypePrompt;
        expect(state.deferred).toBe(true);
        expect(state.detect).toBe('idle');
    });
});

describe('варианты окна', () => {
    it('по пунктам поля компании на портале, в порядке окна', () => {
        const store = readyStore();
        expect(
            selectClientTypePromptOptions(store.getState()).map(
                option => option.label,
            ),
        ).toEqual([
            'Коммерческие',
            'Бюджетники',
            'ИП',
            'Физ. лицо',
            'Адвокаты',
        ]);
    });

    it('на портале пунктов меньше — только те, что есть', () => {
        const store = readyStore(makePortal({ itemCodes: ['commerc', 'ip'] }));
        expect(
            selectClientTypePromptOptions(store.getState()).map(
                option => option.code,
            ),
        ).toEqual(['commerc', 'ip']);
    });

    it('поля нет на портале — вариантов нет', () => {
        const store = readyStore(makePortal({ withoutField: true }));
        expect(selectClientTypePromptOptions(store.getState())).toEqual([]);
    });
});

describe('реквизиты не нужны для вопроса, если они не определили тип', () => {
    it('реквизиты разных типов: тип неизвестен, окно появляется', () => {
        const { store } = makePromptStore();
        loadDeal(store);
        loadPortal(store, makePortal());
        loadRequisites(store, [RQ_TYPE.IP, RQ_TYPE.FIZ]);
        store.dispatch(clientTypePromptActions.detectFinished());

        expect(selectClientTypePromptVisible(store.getState())).toBe(true);
    });
});
