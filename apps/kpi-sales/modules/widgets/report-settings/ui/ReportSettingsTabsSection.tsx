'use client';

import { SectionCard } from '@workspace/april-ui';
import type { PortalViewTabOption } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { ReportSettingsSwitchRow } from './ReportSettingsSwitchRow';

const T = REPORT_SETTINGS_TEXT.tabs;

interface ReportSettingsTabsSectionProps {
    tabs: readonly PortalViewTabOption[];
    /** Коды скрытых вкладок из формы. */
    hiddenTabs: readonly string[];
    onChange: (code: string, visible: boolean) => void;
}

/** «Вкладки отчёта»: по переключателю на вкладку, включено — вкладка видна. */
export const ReportSettingsTabsSection = ({
    tabs,
    hiddenTabs,
    onChange,
}: ReportSettingsTabsSectionProps) => (
    <SectionCard title={T.title} density="compact">
        <div>
            {tabs.map(tab => (
                <ReportSettingsSwitchRow
                    key={tab.code}
                    id={`report-settings-tab-${tab.code}`}
                    label={tab.name}
                    checked={!hiddenTabs.includes(tab.code)}
                    onChange={visible => onChange(tab.code, visible)}
                />
            ))}
        </div>
        <p className="text-xs text-muted-foreground">{T.note}</p>
    </SectionCard>
);
