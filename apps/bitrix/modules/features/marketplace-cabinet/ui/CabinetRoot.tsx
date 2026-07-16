'use client';

import { useEffect, useState } from 'react';
import {
    getOnboardingState,
    SessionExpiredError,
    type OnboardingState,
} from '@workspace/bitrix';
import { usePortalSession } from '../lib/use-portal-session.hook';
import { OnboardingForm } from './OnboardingForm';
import { ActiveCabinet } from './ActiveCabinet';
import {
    BlockedScreen,
    LoadingScreen,
    PendingScreen,
    SessionExpiredScreen,
    UnauthorizedScreen,
} from './StatusScreens';

/**
 * Корень кабинета: маршрутизация экранов по состоянию допуска.
 *
 * Источник правды — portal-context сессия (@workspace/bitrix):
 * bootstrap меняет одноразовый code из query на Bearer-токен; состояние
 * (onboarding/pending/active/blocked) приходит с сессией и обновляется
 * стором после действий (подача заявки) или 401 (expired).
 * Query-параметрам страница НЕ доверяет (кроме fallback-state, когда
 * сессии нет вовсе).
 */
export const CabinetRoot = () => {
    const { status, session, fallbackState } = usePortalSession();
    const [pendingDetails, setPendingDetails] =
        useState<OnboardingState | null>(null);

    // Для pending-экрана подтягиваем поданную заявку (название организации)
    useEffect(() => {
        if (status !== 'ready' || session?.state !== 'pending') {
            return;
        }
        getOnboardingState()
            .then(setPendingDetails)
            .catch((error) => {
                if (!(error instanceof SessionExpiredError)) {
                    setPendingDetails(null);
                }
            });
    }, [status, session?.state]);

    if (status === 'idle' || status === 'loading') {
        return <LoadingScreen />;
    }
    if (status === 'expired') {
        return <SessionExpiredScreen />;
    }
    if (status === 'absent' || !session) {
        // сессии нет: unauthorized/прямое открытие вне Битрикса
        return fallbackState === 'blocked' ? (
            <BlockedScreen />
        ) : (
            <UnauthorizedScreen />
        );
    }

    switch (session.state) {
        case 'onboarding':
            return (
                <OnboardingForm domain={session.domain} user={session.user} />
            );
        case 'pending':
            return (
                <PendingScreen
                    domain={session.domain}
                    organizationName={pendingDetails?.organization?.name}
                />
            );
        case 'blocked':
            return <BlockedScreen domain={session.domain} />;
        case 'active':
        default:
            return (
                <ActiveCabinet domain={session.domain} user={session.user} />
            );
    }
};
