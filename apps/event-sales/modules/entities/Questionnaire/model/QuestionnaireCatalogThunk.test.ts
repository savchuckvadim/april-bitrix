import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getCatalog, getVersion } = vi.hoisted(() => ({
    getCatalog: vi.fn(),
    getVersion: vi.fn(),
}));

vi.mock('../lib/api/questionnaire-helper', () => ({
    QuestionnaireHelper: class {
        getCatalog = (domain: string) => getCatalog(domain);
        getVersion = (domain: string) => getVersion(domain);
    },
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { UnknownAction } from '@reduxjs/toolkit';
import { FALLBACK_CATALOG } from '../data/fallback-catalog';
import type { QuestionnaireCatalogDto } from './questionnaire-dto.type';
import {
    questionnaireCatalogActions,
    questionnaireCatalogReducer,
    type QuestionnaireCatalogState,
} from './QuestionnaireCatalogSlice';
import {
    ensureQuestionnaireCatalog,
    fetchQuestionnaireCatalog,
} from './QuestionnaireCatalogThunk';

/**
 * Thunk каталога: любой провал ведёт во встроенный набор и НЕ бросает.
 *
 * Сегодня это основной сценарий — миграция таблиц не накатана, эндпоинт
 * отвечает 500; отправка отчёта на всех порталах от этого зависеть не может.
 */

const SERVER_CATALOG: QuestionnaireCatalogDto = {
    contract: 1,
    version: 7,
    hash: 'sha1-состава',
    questionnaires: [
        {
            code: 'portalRefine',
            title: 'Доработка портала',
            hint: null,
            purpose: 'plan',
            presentation: 'inline',
            place: 'plan',
            persist: 'onChange',
            conditions: [{ kind: 'planType', values: ['refine'] }],
            configKey: null,
            legacyChecklistId: 'refine',
            sort: 10,
            version: 7,
            items: [
                {
                    code: 'objection',
                    title: 'Возражение',
                    placeholder: null,
                    hint: null,
                    groupTitle: null,
                    sort: 10,
                    control: 'string',
                    isRequired: true,
                    requireChange: false,
                    staleAfterDays: null,
                    channel: 'crm',
                    dtoPath: null,
                    target: { mode: 'auto', entity: null },
                    // Ответ уходит в поле CRM: смарт-носителя у него нет.
                    smart: null,
                    isNative: false,
                    field: { name: 'UF_CRM_1712345678', type: 'string' },
                    options: [],
                },
            ],
        },
    ],
};

/** Мини-стор: thunk исполняется, экшены прокатываются через редьюсер. */
const runFetch = async (
    domain: string,
    preset?: UnknownAction,
): Promise<{ state: QuestionnaireCatalogState; actions: UnknownAction[] }> => {
    let state = questionnaireCatalogReducer(undefined, { type: '@@init' });
    if (preset) state = questionnaireCatalogReducer(state, preset);

    const actions: UnknownAction[] = [];
    const dispatch = ((action: UnknownAction) => {
        actions.push(action);
        state = questionnaireCatalogReducer(state, action);
        return action;
    }) as AppDispatch;
    const getState = (() => ({
        questionnaireCatalog: state,
    })) as unknown as AppGetState;

    await fetchQuestionnaireCatalog(domain)(dispatch, getState, {
        getWSClient: () => {
            throw new Error('WS в тесте не нужен');
        },
    } as never);

    return { state, actions };
};

/**
 * Живой мини-стор на несколько заходов подряд: ensure зовут повторно (⟳),
 * и проверять надо именно НАКОПЛЕННОЕ поведение, а не один вызов.
 */
const makeStore = () => {
    let state = questionnaireCatalogReducer(undefined, { type: '@@init' });
    const getState = (() => ({
        questionnaireCatalog: state,
    })) as unknown as AppGetState;
    const dispatch = ((action: UnknownAction | AppThunkLike) => {
        if (typeof action === 'function') {
            return action(dispatch, getState, undefined as never);
        }
        state = questionnaireCatalogReducer(state, action);
        return action;
    }) as AppDispatch;

    return {
        dispatch,
        getState,
        catalog: () => state,
    };
};

type AppThunkLike = (
    dispatch: AppDispatch,
    getState: AppGetState,
    extra: never,
) => unknown;

beforeEach(() => {
    getCatalog.mockReset();
    getVersion.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
});

describe('загрузка каталога анкет', () => {
    it('исполнимый каталог применяется целиком', async () => {
        getCatalog.mockResolvedValue(SERVER_CATALOG);

        const { state } = await runFetch('gsr.bitrix24.ru');

        expect(getCatalog).toHaveBeenCalledWith('gsr.bitrix24.ru');
        expect(state.status).toBe('ready');
        expect(state.source).toBe('server');
        expect(state.hash).toBe('sha1-состава');
        expect(state.version).toBe(7);
        expect(state.defs.map(def => def.code)).toEqual(['portalRefine']);
    });

    it('ошибка бэка не бросает наружу и оставляет встроенный набор', async () => {
        getCatalog.mockRejectedValue(
            new Error('Table portal_questionnaires missing'),
        );

        const { state } = await runFetch('gsr.bitrix24.ru');

        expect(state.status).toBe('error');
        expect(state.source).toBe('fallback');
        expect(state.defs).toBe(FALLBACK_CATALOG);
    });

    it('портал без анкет — встроенный набор без ошибки на экране', async () => {
        getCatalog.mockResolvedValue({ ...SERVER_CATALOG, questionnaires: [] });

        const { state } = await runFetch('gsr.bitrix24.ru');

        expect(state.source).toBe('fallback');
        expect(state.defs).toBe(FALLBACK_CATALOG);
    });

    it('чужой контракт — встроенный набор', async () => {
        getCatalog.mockResolvedValue({ ...SERVER_CATALOG, contract: 2 });

        const { state } = await runFetch('gsr.bitrix24.ru');

        expect(state.source).toBe('fallback');
    });

    it('каталог, отсеянный целиком, — встроенный набор', async () => {
        const entry = SERVER_CATALOG.questionnaires[0]!;
        getCatalog.mockResolvedValue({
            ...SERVER_CATALOG,
            questionnaires: [
                {
                    ...entry,
                    items: [{ ...entry.items[0]!, control: 'file' }],
                },
            ],
        });

        const { state } = await runFetch('gsr.bitrix24.ru');

        expect(state.source).toBe('fallback');
        expect(state.defs).toBe(FALLBACK_CATALOG);
    });

    it('без домена запрос не уходит (бэк ответил бы 400)', async () => {
        const { state } = await runFetch('');

        expect(getCatalog).not.toHaveBeenCalled();
        expect(state.source).toBe('fallback');
        expect(state.status).toBe('error');
    });

    it('повторный вызов на лету не дублирует запрос', async () => {
        getCatalog.mockResolvedValue(SERVER_CATALOG);

        const { actions } = await runFetch(
            'gsr.bitrix24.ru',
            questionnaireCatalogActions.pending({
                domain: 'gsr.bitrix24.ru',
            }),
        );

        expect(getCatalog).not.toHaveBeenCalled();
        expect(actions).toEqual([]);
    });
});

describe('перечитывание каталога (⟳ и смена портала)', () => {
    it('⟳ не перечитывает состав: хэш тот же — запроса каталога нет', async () => {
        getCatalog.mockResolvedValue(SERVER_CATALOG);
        getVersion.mockResolvedValue({ version: 7, hash: 'sha1-состава' });
        const store = makeStore();

        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );
        const afterInit = store.catalog().defs;

        // Кнопка ⟳ прогоняет init заново — со всеми листенерами.
        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );

        expect(getCatalog).toHaveBeenCalledTimes(1);
        expect(getVersion).toHaveBeenCalledTimes(1);
        // Тот же массив: вопросы на экране не перерисовываются вовсе.
        expect(store.catalog().defs).toBe(afterInit);
    });

    it('портал изменил анкеты — расхождение хэша тянет свежий состав', async () => {
        getCatalog.mockResolvedValue(SERVER_CATALOG);
        getVersion.mockResolvedValue({ version: 8, hash: 'другой-хэш' });
        const store = makeStore();

        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );
        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );

        expect(getCatalog).toHaveBeenCalledTimes(2);
    });

    it('другой портал — состав читается целиком, без сверки версии', async () => {
        getCatalog.mockResolvedValue(SERVER_CATALOG);
        const store = makeStore();

        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );
        await ensureQuestionnaireCatalog('other.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );

        expect(getCatalog).toHaveBeenNthCalledWith(2, 'other.bitrix24.ru');
        expect(getVersion).not.toHaveBeenCalled();
        expect(store.catalog().domain).toBe('other.bitrix24.ru');
    });

    it('версию не проверить — действует состав, который уже в руках', async () => {
        getCatalog.mockResolvedValue(SERVER_CATALOG);
        getVersion.mockRejectedValue(new Error('502'));
        const store = makeStore();

        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );
        const afterInit = store.catalog().defs;
        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );

        expect(getCatalog).toHaveBeenCalledTimes(1);
        expect(store.catalog().defs).toBe(afterInit);
        expect(store.catalog().source).toBe('server');
    });

    it('бэк ожил после провала — ⟳ подхватывает каталог', async () => {
        // Сегодняшний боевой сценарий: миграция не накатана, первый заход
        // ушёл в fallback. Хэш при провале гасится, поэтому первый удачный
        // ответ версии расходится с пустым и тянет состав.
        getCatalog.mockRejectedValueOnce(new Error('500'));
        getCatalog.mockResolvedValue(SERVER_CATALOG);
        getVersion.mockResolvedValue({ version: 7, hash: 'sha1-состава' });
        const store = makeStore();

        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );
        expect(store.catalog().source).toBe('fallback');

        await ensureQuestionnaireCatalog('gsr.bitrix24.ru')(
            store.dispatch,
            store.getState,
            undefined as never,
        );

        expect(getCatalog).toHaveBeenCalledTimes(2);
        expect(store.catalog().source).toBe('server');
    });

    it('без домена запросов нет вовсе', async () => {
        const store = makeStore();

        await ensureQuestionnaireCatalog('')(
            store.dispatch,
            store.getState,
            undefined as never,
        );

        expect(getCatalog).not.toHaveBeenCalled();
        expect(getVersion).not.toHaveBeenCalled();
        expect(store.catalog().source).toBe('fallback');
    });
});
