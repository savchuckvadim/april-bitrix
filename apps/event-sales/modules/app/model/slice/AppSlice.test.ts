import { describe, expect, it } from 'vitest';
import { getDomainConfig } from '../../consts/domain-config';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { APP_FROM_ENUM, appActions, appReducer } from './AppSlice';

/**
 * Ранняя точка init-цикла: setDomain пересобирает доменный конфиг ДО
 * резолва сущностей, чтобы независимые цепочки (настройки, каталог, портал,
 * отдел) стартовали сразу после Bitrix.start.
 *
 * Что здесь защищается: патч портальных настроек (mergeConfig), успевший
 * лечь между ранним setDomain и поздним setAppData, обязан ПЕРЕЖИТЬ
 * setAppData — иначе ранний старт fetchAppConfig сам себя обнулял бы, и
 * список дел снова уходил бы с доменным хардкодом (рецидив инцидента 27.08).
 */

const DOMAIN = 'gsr.bitrix24.ru';
/** gsr: доменный дефолт из DOMAIN_OVERRIDES. */
const DOMAIN_TASK_GROUP = getDomainConfig(DOMAIN).taskGroupId;

const setAppData = (domain: string) =>
    appActions.setAppData({
        domain,
        user: null,
        placement: null,
        deal: null,
        company: null,
        lead: null,
        display: APP_DISPLAY_MODE.PUBLIC,
        task: null,
        from: APP_FROM_ENUM.COMPANY,
    });

const initial = () => appReducer(undefined, { type: '@@INIT' });

describe('setDomain — ранняя точка init-цикла', () => {
    it('ставит домен, пересобирает конфиг по нему и чистит портальные ключи', () => {
        let state = appReducer(
            initial(),
            appActions.mergeConfig({ taskGroupId: 77 }),
        );
        state = appReducer(
            state,
            appActions.setDomain({ domain: DOMAIN, user: null }),
        );

        expect(state.domain).toBe(DOMAIN);
        expect(state.config.taskGroupId).toBe(DOMAIN_TASK_GROUP);
        expect(state.configPortalKeys).toEqual([]);
    });

    it('портальный патч, пришедший ДО setAppData, переживает setAppData', () => {
        // Боевой порядок раннего старта: setDomain → mergeConfig (кэш
        // настроек) → setAppData (сущности отрезолвились позже).
        let state = appReducer(
            initial(),
            appActions.setDomain({ domain: DOMAIN, user: null }),
        );
        state = appReducer(state, appActions.mergeConfig({ taskGroupId: 77 }));
        state = appReducer(state, setAppData(DOMAIN));

        expect(state.config.taskGroupId).toBe(77);
        expect(state.configPortalKeys).toContain('taskGroupId');
    });

    it('setAppData с ДРУГИМ доменом пересобирает конфиг (запасной путь без setDomain)', () => {
        // Циклы, где setDomain не звали (юнит-тесты, нештатные пути),
        // ведут себя как раньше: конфиг соответствует домену payload'а.
        const state = appReducer(initial(), setAppData(DOMAIN));

        expect(state.config.taskGroupId).toBe(DOMAIN_TASK_GROUP);
        expect(state.configPortalKeys).toEqual([]);
    });

    it('⟳: повторный setDomain возвращает доменный дефолт — сброшенная в админке настройка не залипает', () => {
        let state = appReducer(
            initial(),
            appActions.setDomain({ domain: DOMAIN, user: null }),
        );
        state = appReducer(state, appActions.mergeConfig({ taskGroupId: 77 }));
        state = appReducer(state, appActions.reload());

        expect(state.isConfigFetched).toBe(false);

        // Повторный init-цикл: пересборка отдаёт доменный дефолт, свежий
        // патч (если настройка всё ещё задана) доедет своим fetchAppConfig.
        state = appReducer(
            state,
            appActions.setDomain({ domain: DOMAIN, user: null }),
        );

        expect(state.config.taskGroupId).toBe(DOMAIN_TASK_GROUP);
        expect(state.configPortalKeys).toEqual([]);
    });
});
