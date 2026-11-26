'use client';

import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import {
    PLAN_COLUMNS_SWITCHES,
    type PlanColumnsSwitch,
    type ReportSettingsIndicatorsForm,
} from '../lib/report-settings-indicators';
import { ReportSettingsSubheading } from './ReportSettingsSubheading';
import { ReportSettingsSwitchRow } from './ReportSettingsSwitchRow';

const T = REPORT_SETTINGS_TEXT.planColumns;

interface ReportSettingsPlanColumnsTabsProps {
    form: Pick<ReportSettingsIndicatorsForm, PlanColumnsSwitch>;
    onChange: (flag: PlanColumnsSwitch, on: boolean) => void;
}

/**
 * На каких вкладках отчёта выводить колонки планов: три переключателя и
 * пояснение — где встаёт колонка, откуда значения, кто её видит.
 */
export const ReportSettingsPlanColumnsTabs = ({
    form,
    onChange,
}: ReportSettingsPlanColumnsTabsProps) => (
    <section aria-label={T.tabsTitle} className="space-y-2">
        <div>
            <ReportSettingsSubheading>{T.tabsTitle}</ReportSettingsSubheading>
            {PLAN_COLUMNS_SWITCHES.map(flag => (
                <ReportSettingsSwitchRow
                    key={flag}
                    id={`report-settings-plan-columns-${flag}`}
                    label={T.switches[flag]}
                    checked={form[flag]}
                    onChange={on => onChange(flag, on)}
                />
            ))}
        </div>
        <p className="text-xs text-muted-foreground">{T.note}</p>
        <p className="text-xs text-muted-foreground">{T.audience}</p>
    </section>
);
