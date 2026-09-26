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
    type AiSettingsTab,
} from '../../lib/ai-settings-form.util';
import { AiSettingsLevelsTab } from './AiSettingsLevelsTab';
import { AiSettingsTargetsTab } from './AiSettingsTargetsTab';
import { AiSettingsAbsencesTab } from './AiSettingsAbsencesTab';
import { AiSettingsRosterTab } from './AiSettingsRosterTab';

const TAB_LABELS: Record<AiSettingsTab, string> = {
    levels: 'Уровни',
    targets: 'Цели по уровням',
    absences: 'Отсутствия',
    roster: 'Состав',
};

interface AiSettingsTabsProps {
    form: AiSettingsForm;
}

/** Вкладки шага правки; вкладка с ошибкой помечена точкой. */
export const AiSettingsTabs = ({ form }: AiSettingsTabsProps) => (
    <Tabs
        value={form.tab}
        onValueChange={value => isAiSettingsTab(value) && form.setTab(value)}
        className="min-h-0 flex-1"
    >
        <TabsList className="w-full">
            {AI_SETTINGS_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab} className="gap-1.5 text-xs">
                    {TAB_LABELS[tab]}
                    {form.errorTabs.includes(tab) && (
                        <span
                            aria-label="есть ошибки"
                            className="size-1.5 rounded-full bg-destructive"
                        />
                    )}
                </TabsTrigger>
            ))}
        </TabsList>
        <div className="pt-1">
            <TabsContent value="levels">
                <AiSettingsLevelsTab
                    rows={form.form.levels}
                    errors={form.errors.levels}
                    disabled={form.disabled}
                    onLevel={form.setLevel}
                    onSince={form.setSince}
                />
            </TabsContent>
            <TabsContent value="targets">
                <AiSettingsTargetsTab
                    rows={form.form.targets}
                    overrides={form.form.overrides}
                    errors={form.errors.targets}
                    disabled={form.disabled}
                    onChange={form.setTarget}
                />
            </TabsContent>
            <TabsContent value="absences">
                <AiSettingsAbsencesTab
                    rows={form.form.absences}
                    errors={form.errors.absences}
                    managers={form.managerOptions}
                    disabled={form.disabled}
                    onAdd={form.addAbsence}
                    onChange={form.patchAbsence}
                    onRemove={form.removeAbsence}
                />
            </TabsContent>
            <TabsContent value="roster">
                <AiSettingsRosterTab
                    loaded={form.settingsLoaded}
                    current={form.form.rosterConfirmedAt}
                    pending={form.form.roster}
                    today={form.today}
                    disabled={form.disabled}
                    onConfirm={form.confirmRoster}
                    onClear={form.clearRoster}
                    onReset={form.resetRoster}
                />
            </TabsContent>
        </div>
    </Tabs>
);
