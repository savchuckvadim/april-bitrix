'use client';

import type { AiSettingsTab } from '../../lib/ai-settings-form.util';
import { AI_SHOWCASE_SETTINGS_SECTIONS } from '../../lib/ai-tabs';
import { AiHowWeCountList } from '../components/AiHowWeCountList';
import { AiSettingsInline } from '../components/AiSettingsInline';

interface AiShowcaseSettingsTabProps {
    /** Руководитель op/cup: секции «Гипотеза качества» и «Пул порталов». */
    canConfigure: boolean;
    /** Секция настроек из URL, к которой прокрутить. */
    focusSection: AiSettingsTab | null;
}

/**
 * Подвкладка «Настройки витрины»: «Гипотеза качества» и «Пул порталов»
 * (тому, кто настраивает) и «Как считаем» по каждому разделу — всем.
 */
export const AiShowcaseSettingsTab = ({ canConfigure, focusSection }: AiShowcaseSettingsTabProps) => (
    <>
        {canConfigure && (
            <AiSettingsInline
                kind="showcase"
                sections={AI_SHOWCASE_SETTINGS_SECTIONS}
                focusSection={focusSection}
            />
        )}
        <AiHowWeCountList />
    </>
);
