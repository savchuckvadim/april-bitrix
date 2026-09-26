'use client';

import { ToneBadge } from '@workspace/april-ui';
import type { AiSettingsTab } from '../lib/ai-settings-form.util';
import { AI_CHECKLIST_VERDICT_VIEW } from '../lib/ai-setup-checklist.data';
import type { AiSetupChecklist as AiSetupChecklistModel } from '../lib/ai-setup-checklist.types';
import { AiSetupChecklistSection } from './components/AiSetupChecklistSection';

interface AiSetupChecklistProps {
    checklist: AiSetupChecklistModel;
    /**
     * Открыть настройки витрины на вкладке. Передаётся только тому, кто
     * настраивает: без колбэка кнопок нет, пункты — текстом «кто и где».
     */
    onOpenSettings?: (tab: AiSettingsTab) => void;
}

/**
 * Чек-лист «Готовность витрины»: итог одной фразой («нужны данные /
 * донастроить / подождать / всё готово») и разделы пунктов. Модель —
 * lib/ai-setup-checklist.util.ts, здесь только вёрстка.
 */
export const AiSetupChecklist = ({
    checklist,
    onOpenSettings,
}: AiSetupChecklistProps) => {
    const verdict = AI_CHECKLIST_VERDICT_VIEW[checklist.verdict];

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <ToneBadge tone={verdict.tone} variant="solid" size="sm">
                    {verdict.label}
                </ToneBadge>
                <span className="text-sm font-medium">
                    {checklist.headline}
                </span>
            </div>
            {checklist.sections.map(section => (
                <AiSetupChecklistSection
                    key={section.key}
                    section={section}
                    onOpenSettings={onOpenSettings}
                />
            ))}
        </div>
    );
};
