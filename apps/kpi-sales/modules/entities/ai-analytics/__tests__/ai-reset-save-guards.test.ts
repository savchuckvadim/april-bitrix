import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BXUser } from '@workspace/bx';
import { appActions } from '@/modules/app/model/AppSlice';
import { aiAnalyticsActions } from '../model/ai-analytics-slice';
import {
    fetchAiDossier,
    fetchAiPlanFact,
    saveAiLevels,
} from '../model/ai-analytics-thunks';
import { AI_SETTINGS_VIEW_AS_ERROR } from '../model/ai-analytics-queued.thunks';
import type { AiSettingsSaveResult } from '../model';
import { dossier, planFact, ready } from './ai-fixtures';
import { makeAiStore } from './ai-test-store';

/*
 * Гарды данных: resetData чистит и секции Фазы 3 (план-факт, досье) с их
 * запросами; saveAiLevels в режиме «Смотреть как…» не пишет от чужого
 * имени и оставляет понятную причину в levels.error.
 */

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getPlanFact, getDossier, saveSettings } = vi.hoisted(() => ({
    getPlanFact: vi.fn(),
    getDossier: vi.fn(),
    saveSettings: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getPlanFact = getPlanFact;
        getDossier = getDossier;
        saveSettings = saveSettings;
    },
}));

const VIEWED_USER = { ID: 7, LAST_NAME: 'Менеджер' } as unknown as BXUser;

beforeEach(() => {
    getPlanFact.mockReset();
    getDossier.mockReset();
    saveSettings.mockReset();
});

describe('resetData — секции Фазы 3', () => {
    it('план-факт и досье вместе с запросами сбрасываются в idle', async () => {
        getPlanFact.mockResolvedValue(ready(planFact()));
        getDossier.mockResolvedValue(ready(dossier()));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiPlanFact({ monthKey: '2026-08' }));
        await store.dispatch(fetchAiDossier({ managerId: '7', months: 3 }));
        expect(store.getState().aiAnalytics.planFact.status).toBe('ready');
        expect(store.getState().aiAnalytics.dossier.status).toBe('ready');

        store.dispatch(aiAnalyticsActions.resetData());

        const ai = store.getState().aiAnalytics;
        expect(ai.planFact).toMatchObject({
            status: 'idle',
            data: null,
            requestKey: null,
        });
        expect(ai.planFactQuery).toBeNull();
        expect(ai.dossier).toMatchObject({
            status: 'idle',
            data: null,
            requestKey: null,
        });
        expect(ai.dossierQuery).toBeNull();
    });
});

describe('saveAiLevels — режим «Смотреть как…»', () => {
    it('запроса нет, null и понятная причина в levels.error', async () => {
        const store = makeAiStore({ leader: true });
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));

        const result = await store.dispatch(
            saveAiLevels({ levels: [{ managerId: 7, level: 'senior' }] }),
        );

        expect(result).toBeNull();
        expect(saveSettings).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.levels).toMatchObject({
            saving: false,
            error: AI_SETTINGS_VIEW_AS_ERROR,
        });
    });

    it('после выхода из режима — сохраняет от реального пользователя', async () => {
        const saved: AiSettingsSaveResult = {
            id: 'ais-1',
            levels: [],
            savedAt: '2026-09-26T10:00:00Z',
            resetCount: 2,
            comparableFrom: '2026-01-10',
            paramsVersion: 'sha',
            breaksSeries: [],
            warnings: [],
        };
        saveSettings.mockResolvedValue(ready(saved));
        const store = makeAiStore({ leader: true });
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        store.dispatch(appActions.setViewAsUser(null));

        const result = await store.dispatch(saveAiLevels({ levels: [] }));

        expect(result?.savedAt).toBe('2026-09-26T10:00:00Z');
        expect(saveSettings).toHaveBeenCalledWith(
            { domain: 'test.bitrix24.ru', requesterUserId: '42' },
            { levels: [] },
        );
        expect(store.getState().aiAnalytics.levels.error).toBeNull();
    });
});
