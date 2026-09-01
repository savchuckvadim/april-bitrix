import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Ранний старт независимых цепочек в appInit.
 *
 * Что здесь защищается:
 * 1. настройки, каталог анкет, слепок портала и отдел стартуют ДО резолва
 *    сущностей плейсмента (1–3 последовательных запроса к Bitrix) — ради
 *    этого весь заход;
 * 2. setDomain уходит строго ПЕРЕД fetchAppConfig: патч портальных настроек
 *    обязан лечь поверх пересобранного доменного конфига;
 * 3. дублей нет: одна точка диспатча на цикл — счётчик по каждой цепочке
 *    равен числу init-циклов (полный init + ⟳ = ровно по два);
 * 4. dev-режим: без домена из фрейма цепочки получают TESTING_DOMAIN;
 * 5. сторож замера первой загрузки взводится ДО первого `await` — иначе бут,
 *    вставший на `Bitrix.start` или на резолве сущностей, не отправил бы
 *    вообще ничего, и в метриках остались бы одни выжившие.
 *
 * Цепочки и тяжёлые утилиты подменены целиком: тест проверяет ОРКЕСТРАЦИЮ
 * бута, а поведение самих цепочек закрывают их собственные тесты
 * (AppConfigThunk.test, QuestionnaireCatalogThunk.test, portal-fetch.test).
 */

const h = vi.hoisted(() => {
    const state = {
        /** Хронологический журнал: типы диспатчей + вехи резолва сущностей. */
        log: [] as string[],
        /** Полные экшены — для проверки payload'ов. */
        actions: [] as Array<{ type: string; payload?: unknown }>,
        /** Ответ getInitializedData — тест переключает фрейм/dev-режим. */
        auth: {
            domain: 'gsr.bitrix24.ru' as string | undefined,
            user: { ID: 7 } as unknown,
            inFrame: true,
        },
        placement: {
            placement: 'CRM_COMPANY_DETAIL_TAB',
            options: { ID: 1 },
        } as unknown,
        display: 'entityCard' as string,
        resolvers: [] as Array<(value: unknown) => void>,
    };

    const chain =
        (type: string) =>
        (...args: unknown[]) => ({
            type,
            payload:
                typeof args[0] === 'string'
                    ? args[0]
                    : ((args[0] as { domain?: string } | null)?.domain ??
                      args[0]),
        });

    return { ...state, chain };
});

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        start: vi.fn(async () => ({
            api: {
                getInitializedData: () => h.auth,
                getPlacement: () => h.placement,
            },
        })),
    },
}));

vi.mock('@workspace/pbx', () => ({
    portalAPI: {
        endpoints: {
            fetchPortal: {
                initiate: vi.fn(h.chain('test/fetchPortal')),
            },
        },
    },
}));

vi.mock('../utills/placement-util', () => ({
    getDisplayMode: vi.fn(() => h.display),
    shouldFitWindow: vi.fn(() => false),
    getEntitiesFromPlacement: vi.fn(() => {
        h.log.push('entities:start');
        return new Promise(resolve => {
            h.resolvers.push(resolve);
        });
    }),
}));

vi.mock('../utills/app-setup-util', () => ({
    initAppEntities: vi.fn(() => {
        h.log.push('initAppEntities');
    }),
    initAppTask: vi.fn(() => {
        h.log.push('initAppTask');
    }),
}));

// Сторож замера — подменён целиком: здесь проверяется только момент его
// взведения, а поведение самого сторожа закрывает boot-metrics.test.
vi.mock('../diagnostics/boot-metrics', () => ({
    armBootMetricsWatchdog: vi.fn(() => {
        h.log.push('boot-watchdog:armed');
    }),
}));

vi.mock('@/modules/features/Departament/model/DepartmentThunk', () => ({
    getDepartment: vi.fn(h.chain('test/getDepartment')),
    setDepartmentMode: vi.fn(h.chain('test/setDepartmentMode')),
}));

vi.mock('../../model/thunk/AppConfigThunk', () => ({
    fetchAppConfig: vi.fn(h.chain('test/fetchAppConfig')),
}));

vi.mock(
    '@/modules/entities/Questionnaire/model/QuestionnaireCatalogThunk',
    () => ({
        ensureQuestionnaireCatalog: vi.fn(
            h.chain('test/ensureQuestionnaireCatalog'),
        ),
    }),
);

import type { AppDispatch, AppGetState } from '../../model/store';
import { appActions } from '../../model/slice/AppSlice';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { TESTING_DOMAIN } from '../../consts/app-global';
import { appInit } from './app-init.util';

/** Все независимые цепочки, чей старт поднят до резолва сущностей. */
const CHAINS = [
    'test/fetchAppConfig',
    'test/ensureQuestionnaireCatalog',
    'test/fetchPortal',
    'test/getDepartment',
] as const;

const dispatch = ((action: { type: string; payload?: unknown }) => {
    h.log.push(action.type);
    h.actions.push(action);
    return action;
}) as unknown as AppDispatch;

const getState = (() => ({})) as unknown as AppGetState;

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

const COMPANY_ENTITIES = {
    currentCompany: { ID: '5' },
    currentDeal: null,
    currentLead: null,
    currentTask: null,
    from: 'company',
};

/** Полный цикл: init → «сеть ответила сущностями» → добежал до конца. */
const runInit = async (entities: unknown = COMPANY_ENTITIES) => {
    const run = appInit(dispatch, getState);
    await tick();
    h.resolvers.shift()?.(entities);
    await run;
};

const countOf = (type: string) => h.log.filter(row => row === type).length;

beforeEach(() => {
    h.log.length = 0;
    h.actions.length = 0;
    h.resolvers.length = 0;
    h.auth = { domain: 'gsr.bitrix24.ru', user: { ID: 7 }, inFrame: true };
    h.placement = { placement: 'CRM_COMPANY_DETAIL_TAB', options: { ID: 1 } };
    h.display = 'entityCard';
    vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('appInit — ранний старт независимых цепочек', () => {
    it('цепочки стартуют до резолва сущностей, setDomain — перед настройками', async () => {
        const run = appInit(dispatch, getState);
        await tick();

        // Сущности ещё «в сети» (резолвер не отпущен), а цепочки уже ушли.
        const entitiesAt = h.log.indexOf('entities:start');
        expect(entitiesAt).toBeGreaterThan(-1);
        for (const chain of CHAINS) {
            const at = h.log.indexOf(chain);
            expect(at, chain).toBeGreaterThan(-1);
            expect(at, chain).toBeLessThan(entitiesAt);
        }

        // Патч настроек ложится поверх доменного конфига: setDomain раньше.
        expect(h.log.indexOf(appActions.setDomain.type)).toBeLessThan(
            h.log.indexOf('test/fetchAppConfig'),
        );
        // Режим отдела, как и раньше, выбирается ДО пересборки конфига.
        expect(h.log.indexOf('test/setDepartmentMode')).toBeLessThan(
            h.log.indexOf(appActions.setDomain.type),
        );

        h.resolvers.shift()?.(COMPANY_ENTITIES);
        await run;

        // Ровно по одному диспатчу на цикл — ни листенеров-дублёров, ни
        // второго захода в конце init.
        for (const chain of CHAINS) {
            expect(countOf(chain), chain).toBe(1);
        }
        expect(countOf(appActions.setDomain.type)).toBe(1);
        expect(h.log).toContain('initAppEntities');
        expect(h.log).toContain('initAppTask');
        expect(h.log).toContain(appActions.setInitializedSuccess.type);
    });

    it('полный init + ⟳: каждая цепочка уходит ровно по разу на цикл', async () => {
        await runInit();
        // ⟳ гонит init заново (useApp перезапускает initial) — цепочки
        // обязаны перечитаться по своим правилам, но без дублей внутри цикла.
        await runInit();

        for (const chain of CHAINS) {
            expect(countOf(chain), chain).toBe(2);
        }
        expect(countOf(appActions.setDomain.type)).toBe(2);
        expect(countOf(appActions.setInitializedSuccess.type)).toBe(2);
    });

    it('сторож замера взводится первым — до Bitrix.start и резолва сущностей', async () => {
        const run = appInit(dispatch, getState);
        await tick();

        // Первая запись журнала, а не «где-то в середине»: ровно на этих
        // двух await бут и виснет, а штатная отправка живёт на терминальном
        // действии, которого в таком буте не будет никогда.
        expect(h.log[0]).toBe('boot-watchdog:armed');
        expect(h.log.indexOf('boot-watchdog:armed')).toBeLessThan(
            h.log.indexOf('entities:start'),
        );

        h.resolvers.shift()?.(COMPANY_ENTITIES);
        await run;

        expect(countOf('boot-watchdog:armed')).toBe(1);
    });

    it('dev-режим: без домена из фрейма цепочки получают TESTING_DOMAIN', async () => {
        h.auth = { domain: undefined, user: undefined, inFrame: false };
        h.placement = null;

        await runInit();

        const setDomain = h.actions.find(
            action => action.type === appActions.setDomain.type,
        );
        expect(
            (setDomain?.payload as { domain: string } | undefined)?.domain,
        ).toBe(TESTING_DOMAIN);

        for (const chain of CHAINS) {
            const action = h.actions.find(row => row.type === chain);
            expect(action?.payload, chain).toBe(TESTING_DOMAIN);
        }
    });

    it('гвард noTaskEntity: цепочки уже в пути, но сущности приложения не инициализируются', async () => {
        h.display = APP_DISPLAY_MODE.TASK;

        await runInit({
            currentCompany: null,
            currentDeal: null,
            currentLead: null,
            currentTask: { id: 1 },
            from: 'company',
        });

        expect(h.log).toContain(appActions.setGuard.type);
        expect(h.log).toContain(appActions.setInitializedSuccess.type);
        expect(h.log).not.toContain('initAppEntities');
        expect(h.log).not.toContain('initAppTask');
        // Ранний старт не зависит от исхода резолва: по одному разу.
        for (const chain of CHAINS) {
            expect(countOf(chain), chain).toBe(1);
        }
    });
});
