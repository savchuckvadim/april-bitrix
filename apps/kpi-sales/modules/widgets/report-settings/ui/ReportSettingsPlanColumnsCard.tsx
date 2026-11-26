'use client';

import { SectionCard } from '@workspace/april-ui';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import type { PlanColumnRowView } from '../lib/report-settings-indicator-rows';
import type {
    PlanColumnsSwitch,
    ReportSettingsIndicatorsForm,
} from '../lib/report-settings-indicators';
import { ReportSettingsPlanColumnsList } from './ReportSettingsPlanColumnsList';
import { ReportSettingsPlanColumnsTabs } from './ReportSettingsPlanColumnsTabs';

interface ReportSettingsPlanColumnsCardProps {
    form: ReportSettingsIndicatorsForm;
    rows: readonly PlanColumnRowView[];
    hasCatalog: boolean;
    /** Колонки включены хотя бы на одной вкладке. */
    anySwitchOn: boolean;
    onSwitchChange: (flag: PlanColumnsSwitch, on: boolean) => void;
    onShownChange: (code: string, shown: boolean) => void;
    onLabelChange: (key: string, value: string) => void;
    onLabelReset: (key: string) => void;
}

/**
 * «Колонки планов»: на каких вкладках колонка плана встаёт перед своим
 * показателем и какие планы выводить колонкой, с названием колонки.
 */
export const ReportSettingsPlanColumnsCard = ({
    form,
    rows,
    hasCatalog,
    anySwitchOn,
    onSwitchChange,
    onShownChange,
    onLabelChange,
    onLabelReset,
}: ReportSettingsPlanColumnsCardProps) => (
    <SectionCard title={REPORT_SETTINGS_TEXT.planColumns.title} density="compact">
        <div className="space-y-4">
            <ReportSettingsPlanColumnsTabs form={form} onChange={onSwitchChange} />
            <ReportSettingsPlanColumnsList
                rows={rows}
                hasCatalog={hasCatalog}
                active={anySwitchOn}
                onShownChange={onShownChange}
                onLabelChange={onLabelChange}
                onLabelReset={onLabelReset}
            />
        </div>
    </SectionCard>
);
