'use client';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import type { AiSettingsForm } from '../../hooks/use-ai-settings-form';
import {
    AI_SETTINGS_TABS,
    isAiSettingsTab,
} from '../../lib/ai-settings-form.util';
import {
    AI_SETTINGS_INLINE_TEXT,
    AI_SETTINGS_SECTION_TEXT,
} from '../../lib/ai-settings-sections.texts';
import { AiSettingsSectionBody } from './AiSettingsSectionBody';

interface AiSettingsTabsProps {
    form: AiSettingsForm;
}

/** Вкладки шага правки диалога; вкладка с ошибкой помечена точкой. */
export const AiSettingsTabs = ({ form }: AiSettingsTabsProps) => (
    <Tabs
        value={form.tab}
        onValueChange={value => isAiSettingsTab(value) && form.setTab(value)}
        className="min-h-0 flex-1"
    >
        <TabsList className="h-auto w-full flex-wrap">
            {AI_SETTINGS_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab} className="gap-1.5 text-xs">
                    {AI_SETTINGS_SECTION_TEXT[tab].label}
                    {form.errorTabs.includes(tab) && (
                        <span
                            aria-label={AI_SETTINGS_INLINE_TEXT.footer.hasErrors}
                            className="size-1.5 rounded-full bg-destructive"
                        />
                    )}
                </TabsTrigger>
            ))}
        </TabsList>
        <div className="pt-1">
            {AI_SETTINGS_TABS.map(tab => (
                <TabsContent key={tab} value={tab}>
                    <AiSettingsSectionBody tab={tab} form={form} />
                </TabsContent>
            ))}
        </div>
    </Tabs>
);
