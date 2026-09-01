import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resetSwrCacheRuntime, writeSwrCache } from '@workspace/api';

import { getAppConfigCacheKey } from '@/modules/app/lib/cache/app-config-cache';

import {
    DIRECT_CAPABILITY_DEFAULTS,
    buildDirectFlowSettings,
    loadDirectFlowSettings,
} from './direct-capability';
import {
    TEST_DOMAIN,
    mountDefaultKvWindow,
    mountKvWindow,
} from './outbox-test-kit';

/**
 * Карта прав прямого пути и сборка FlowSettings: дефолты доктрины А4 (все
 * опциональные права выключены) и зеркальность бэковым выражениям
 * isTaskChecklistEnabled / resolveFieldPolicySettings.
 */

describe('DIRECT_CAPABILITY_DEFAULTS — карта прав доктрины А4', () => {
    it('все опциональные права выключены (отсутствие права ≡ запрету)', () => {
        expect(DIRECT_CAPABILITY_DEFAULTS).toEqual({
            allowSmartWrites: false,
            allowKpiWrites: false,
            allowPresDealWrites: false,
            allowXoDealWrites: false,
            allowLeadRequestSync: false,
            allowTransferNotify: false,
        });
    });
});

describe('buildDirectFlowSettings — зеркало бэковых выражений', () => {
    it('без настроек: чек-листы выключены, политики полей — дефолты схемы (undefined)', () => {
        const settings = buildDirectFlowSettings(null);

        expect(settings.withTaskChecklist).toBe(false);
        expect(settings.fieldPolicySettings).toBeUndefined();
        expect(settings.capabilities).toEqual(DIRECT_CAPABILITY_DEFAULTS);
        expect(settings.leadUfDefinitions).toBeUndefined();
    });

    it('значения портала коэрцируются Boolean — как у бэкового use-case', () => {
        const settings = buildDirectFlowSettings({
            withTaskChecklist: true,
            withCalculatedNextEvent: false,
            withFinalFieldsReset: true,
        });

        expect(settings.withTaskChecklist).toBe(true);
        expect(settings.fieldPolicySettings).toEqual({
            calculatedNextEvent: false,
            resetOnFinal: true,
        });
    });

    it('ответ без ключей политик (кэш прошлой схемы) — политики undefined, дефолты схемы решает use-case', () => {
        const settings = buildDirectFlowSettings({ withTaskChecklist: false });

        expect(settings.fieldPolicySettings).toBeUndefined();
    });

    it('капабилити — копия дефолтов, а не общая ссылка', () => {
        const settings = buildDirectFlowSettings(null);

        expect(settings.capabilities).not.toBe(DIRECT_CAPABILITY_DEFAULTS);
    });
});

describe('loadDirectFlowSettings — слепок настроек из swr-кэша', () => {
    beforeEach(() => {
        mountDefaultKvWindow();
        resetSwrCacheRuntime();
    });

    afterEach(() => {
        mountKvWindow(null);
        resetSwrCacheRuntime();
    });

    it('читает ту же запись, которой живёт AppConfigThunk', async () => {
        await writeSwrCache(getAppConfigCacheKey(TEST_DOMAIN), {
            withTaskChecklist: true,
            withCalculatedNextEvent: true,
            withFinalFieldsReset: false,
        });

        const settings = await loadDirectFlowSettings(TEST_DOMAIN);

        expect(settings.withTaskChecklist).toBe(true);
        expect(settings.fieldPolicySettings).toEqual({
            calculatedNextEvent: true,
            resetOnFinal: false,
        });
        expect(settings.capabilities).toEqual(DIRECT_CAPABILITY_DEFAULTS);
    });

    it('кэша нет — безопасные дефолты, как у бэка при упавших настройках', async () => {
        const settings = await loadDirectFlowSettings(TEST_DOMAIN);

        expect(settings.withTaskChecklist).toBe(false);
        expect(settings.fieldPolicySettings).toBeUndefined();
        expect(settings.capabilities).toEqual(DIRECT_CAPABILITY_DEFAULTS);
    });
});
