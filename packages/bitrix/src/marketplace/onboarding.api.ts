import { pbxRequest } from './pbx-api.client';
import { portalSessionStore } from './session.store';
import type {
    OnboardingApplication,
    OnboardingState,
} from './session.types';

/**
 * API онбординга (под portal-context Bearer — клиент подставляет сам).
 * Контракт: back /api/bitrix-marketplace/onboarding.
 */

/** Текущее состояние допуска + поданная заявка */
export function getOnboardingState(): Promise<OnboardingState> {
    return pbxRequest<OnboardingState>({
        method: 'GET',
        path: '/api/bitrix-marketplace/onboarding/state',
    });
}

/**
 * Подать/отредактировать заявку (организация + email).
 * Обновляет состояние допуска в сторе (кабинет сразу перерисуется).
 */
export async function submitOnboardingApplication(
    application: OnboardingApplication,
): Promise<OnboardingState> {
    const result = await pbxRequest<OnboardingState>({
        method: 'POST',
        path: '/api/bitrix-marketplace/onboarding',
        body: application,
    });
    portalSessionStore.patchState(result.state);
    return result;
}
