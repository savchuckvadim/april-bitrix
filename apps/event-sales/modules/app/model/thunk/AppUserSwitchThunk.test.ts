import { describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock('@/modules/processes/event/model/SendThunk', () => ({
    cleanEvent: () => async () => {
        h.calls.push('cleanEvent');
    },
}));

vi.mock('./AppThunk', () => ({
    reinitApp: () => async () => {
        h.calls.push('reinitApp');
    },
}));

vi.mock('../../lib/utills/app-state-util', () => ({
    getIsTmcMode: () => false,
    getClientContext: () => 'company',
}));

import type { AppDispatch, AppGetState } from '../store';
import { headModeActions } from '@/modules/features/HeadMode/model/HeadModeSlice';
import { switchAppUser } from './AppUserSwitchThunk';

describe('switchAppUser', () => {
    it('форма чистится ДО смены пользователя, бут — после сброса подчинённых', async () => {
        const apply = { type: 'impersonation/started' };
        const dispatch = (async (action: unknown) => {
            if (typeof action === 'function') {
                return action(dispatch, () => ({}));
            }
            h.calls.push((action as { type: string }).type);
            return action;
        }) as unknown as AppDispatch;

        await switchAppUser(apply)(dispatch, (() => ({})) as AppGetState);

        expect(h.calls).toEqual([
            'cleanEvent',
            'impersonation/started',
            headModeActions.resetPerimeter().type,
            'reinitApp',
        ]);
    });
});
