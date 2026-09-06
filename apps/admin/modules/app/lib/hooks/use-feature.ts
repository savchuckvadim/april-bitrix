'use client';

import { isFeatureEnabled, type AppFeature } from '../../consts/app-features';

/**
 * Включена ли фича приложения. Сейчас флаги статичны (env на сборке);
 * хук — точка расширения, чтобы переезд флагов в стор или настройки
 * не трогал потребителей.
 */
export const useFeature = (feature: AppFeature): boolean =>
    isFeatureEnabled(feature);
