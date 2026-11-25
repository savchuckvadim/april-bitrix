'use client';

import { SectionCard } from '@workspace/april-ui';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { ReportSettingsSwitchRow } from './ReportSettingsSwitchRow';

const T = REPORT_SETTINGS_TEXT.charts;

interface ReportSettingsChartsSectionProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

/** «Графики»: показывать ли графики в отчёте (на телефоне они скрыты всегда). */
export const ReportSettingsChartsSection = ({
    enabled,
    onChange,
}: ReportSettingsChartsSectionProps) => (
    <SectionCard title={T.title} density="compact">
        <ReportSettingsSwitchRow
            id="report-settings-charts"
            label={T.switchLabel}
            checked={enabled}
            onChange={onChange}
        />
        <p className="text-xs text-muted-foreground">{T.note}</p>
    </SectionCard>
);
