'use client';

import type { ReactNode } from 'react';
import { useIsMobile } from '@workspace/april-ui';
// Прямой путь к хуку: барель фичи тянет UI и стор (как в app-layout-kind.ts).
import { useChartsEnabledSetting } from '@/modules/feature/portal-view/hooks/use-portal-view';
import { ChartsVisibilityProvider, chartsVisible } from '@/modules/shared';

/**
 * Единое решение «показывать ли графики» для всех страниц приложения (отчёт,
 * «Разборы звонков», «Настройки», отчёт сотрудника, публичная ссылка): графики
 * видны, только когда портал их разрешил и экран не телефон. На публичных
 * страницах настройки портала не загружены (по умолчанию «включены»), поэтому
 * там действует только правило телефона.
 */
export const AppChartsVisibility = ({ children }: { children: ReactNode }) => {
    const settingEnabled = useChartsEnabledSetting();
    const isMobile = useIsMobile();
    return (
        <ChartsVisibilityProvider visible={chartsVisible(settingEnabled, isMobile)}>
            {children}
        </ChartsVisibilityProvider>
    );
};
