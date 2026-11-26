'use client';

import type { PortalViewIndicator } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { useReportSettingsIndicators } from '../hooks/use-report-settings-indicators';
import type {
    PlanColumnsSwitch,
    ReportSettingsIndicatorsForm,
} from '../lib/report-settings-indicators';
import { ReportSettingsLabelsCard } from './ReportSettingsLabelsCard';
import { ReportSettingsPlanColumnsCard } from './ReportSettingsPlanColumnsCard';
import { ReportSettingsSectionHead } from './ReportSettingsSectionHead';

const SECTION = REPORT_SETTINGS_TEXT.sections.indicators;

interface ReportSettingsIndicatorsSectionProps {
    /** Каталог показателей портала (options.indicators). */
    indicators: readonly PortalViewIndicator[];
    form: ReportSettingsIndicatorsForm;
    onLabelChange: (key: string, value: string) => void;
    onLabelReset: (key: string) => void;
    onSwitchChange: (flag: PlanColumnsSwitch, on: boolean) => void;
    onPlanColumnShown: (code: string, shown: boolean) => void;
}

/**
 * Раздел «Показатели»: свои названия показателей и колонки планов — двумя
 * карточками друг под другом. Своё название, набранное в первой карточке,
 * сразу видно в подписях второй.
 */
export const ReportSettingsIndicatorsSection = ({
    indicators,
    form,
    onLabelChange,
    onLabelReset,
    onSwitchChange,
    onPlanColumnShown,
}: ReportSettingsIndicatorsSectionProps) => {
    const view = useReportSettingsIndicators(form, indicators);
    return (
        <div className="space-y-4">
            <ReportSettingsSectionHead title={SECTION.title} description={SECTION.description} />
            <ReportSettingsLabelsCard
                groups={view.labelGroups}
                hasCatalog={view.hasCatalog}
                onChange={onLabelChange}
                onReset={onLabelReset}
            />
            <ReportSettingsPlanColumnsCard
                form={form}
                rows={view.planRows}
                hasCatalog={view.hasCatalog}
                anySwitchOn={view.anySwitchOn}
                onSwitchChange={onSwitchChange}
                onShownChange={onPlanColumnShown}
                onLabelChange={onLabelChange}
                onLabelReset={onLabelReset}
            />
        </div>
    );
};
