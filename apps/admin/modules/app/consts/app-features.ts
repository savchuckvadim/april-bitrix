/**
 * Фич-флаги приложения админки.
 *
 * Значение читается из `NEXT_PUBLIC_FEATURE_*` на сборке (Next инлайнит
 * `NEXT_PUBLIC_*` в бандл, поэтому переменная обязана стоять в коде
 * литералом, а не собираться из строки). Не задана — в dev фича включена,
 * в prod выключена: новый раздел не должен появиться на бою раньше, чем
 * его явно включили.
 */

/** Ключи фич приложения. */
export type AppFeature = 'aiAnalytics';

/** `'1' | 'true' | 'on' | 'yes'` — включено, `'0' | 'false' | 'off' | 'no'` — выключено, иначе дефолт. */
const parseFeatureFlag = (raw: string | undefined, fallback: boolean): boolean => {
    const value = raw?.trim().toLowerCase();
    if (value === '1' || value === 'true' || value === 'on' || value === 'yes') {
        return true;
    }
    if (value === '0' || value === 'false' || value === 'off' || value === 'no') {
        return false;
    }
    return fallback;
};

const DEV_DEFAULT = process.env.NODE_ENV !== 'production';

export const APP_FEATURES: Readonly<Record<AppFeature, boolean>> = {
    /** Раздел «AI-аналитика ОП» (аудит данных). Env: NEXT_PUBLIC_FEATURE_AI_ANALYTICS. */
    aiAnalytics: parseFeatureFlag(
        process.env.NEXT_PUBLIC_FEATURE_AI_ANALYTICS,
        DEV_DEFAULT,
    ),
};

export const isFeatureEnabled = (feature: AppFeature): boolean =>
    APP_FEATURES[feature];
