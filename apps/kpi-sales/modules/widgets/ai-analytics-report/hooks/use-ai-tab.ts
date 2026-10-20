'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AiSettingsTab } from '../lib/ai-settings-form.util';
import {
    AI_SECTION_PARAM,
    AI_TAB_PARAM,
    aiTabOfSettingsTab,
    parseAiSettingsSection,
    parseAiTab,
    withAiTab,
    type AiTabKey,
} from '../lib/ai-tabs';

/**
 * Подвкладка вкладки AI из URL (`?aiTab=`) и секция настроек (`?aiSection=`),
 * переход без перезагрузки и без прокрутки страницы. openSettings(tab) —
 * открыть подвкладку, где живёт секция настроек, и прокрутить к ней
 * (прокручивает сама секция, когда смонтируется).
 */
export const useAiTab = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = parseAiTab(searchParams.get(AI_TAB_PARAM));
    const section = parseAiSettingsSection(searchParams.get(AI_SECTION_PARAM));

    const setTab = useCallback(
        (next: AiTabKey) => {
            router.replace(
                `${pathname}${withAiTab(searchParams.toString(), next)}`,
                { scroll: false },
            );
        },
        [router, pathname, searchParams],
    );

    const openSettings = useCallback(
        (settingsTab: AiSettingsTab) => {
            router.replace(
                `${pathname}${withAiTab(
                    searchParams.toString(),
                    aiTabOfSettingsTab(settingsTab),
                    settingsTab,
                )}`,
                { scroll: false },
            );
        },
        [router, pathname, searchParams],
    );

    return { tab, section, setTab, openSettings };
};
