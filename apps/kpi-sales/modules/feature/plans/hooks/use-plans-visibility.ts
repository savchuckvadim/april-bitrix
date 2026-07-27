'use client';

import { useSyncExternalStore } from 'react';
import { getBlockState } from '@/modules/entities/report';
import { UI_SETTINGS_TOUCH_EVENT } from '@/modules/shared/lib/ui-settings-touch';
import { PLANS_BLOCK_ID } from '../lib/plans.data';

const subscribe = (onChange: () => void): (() => void) => {
    if (typeof window === 'undefined') return () => undefined;
    window.addEventListener(UI_SETTINGS_TOUCH_EVENT, onChange);
    return () => window.removeEventListener(UI_SETTINGS_TOUCH_EVENT, onChange);
};

const getSnapshot = (): boolean => getBlockState(PLANS_BLOCK_ID).isVisible;

/**
 * Видимость планов в отчёте = видимость блока «Планы» (тумблер
 * ReportBlockWrapper — та самая «единственная настройка» рядового).
 * Скрыт — гаснут и блок, и план-аннотации в таблицах, и планы в Excel.
 * Реактивность — событие kpi-ui-settings-touch (persist-мост настроек).
 */
export const usePlansVisibility = (): boolean =>
    useSyncExternalStore(subscribe, getSnapshot, () => true);
