'use client';

import type { PortalViewTabOption } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { ReportSettingsChartsSection } from './ReportSettingsChartsSection';
import { ReportSettingsSectionHead } from './ReportSettingsSectionHead';
import { ReportSettingsTabsSection } from './ReportSettingsTabsSection';

const T = REPORT_SETTINGS_TEXT.sections.report;

interface ReportSettingsReportSectionProps {
    tabs: readonly PortalViewTabOption[];
    /** Коды скрытых вкладок из формы. */
    hiddenTabs: readonly string[];
    chartsEnabled: boolean;
    onTabChange: (code: string, visible: boolean) => void;
    onChartsChange: (enabled: boolean) => void;
}

/**
 * Раздел «Вкладки и графики»: что сотрудники портала видят в отчёте. Две
 * карточки рядом на широком экране, друг под другом — на узком.
 */
export const ReportSettingsReportSection = ({
    tabs,
    hiddenTabs,
    chartsEnabled,
    onTabChange,
    onChartsChange,
}: ReportSettingsReportSectionProps) => (
    <div className="space-y-4">
        <ReportSettingsSectionHead title={T.title} description={T.description} />
        <div className="grid items-start gap-4 lg:grid-cols-2">
            <ReportSettingsTabsSection
                tabs={tabs}
                hiddenTabs={hiddenTabs}
                onChange={onTabChange}
            />
            <ReportSettingsChartsSection
                enabled={chartsEnabled}
                onChange={onChartsChange}
            />
        </div>
    </div>
);
