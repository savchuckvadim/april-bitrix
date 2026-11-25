'use client';

import { useReportSettingsForm } from '../hooks/use-report-settings-form';
import { lastChangeText } from '../lib/report-settings-format';
import { ReportSettingsBadgesSection } from './ReportSettingsBadgesSection';
import { ReportSettingsChartsSection } from './ReportSettingsChartsSection';
import { ReportSettingsFooter } from './ReportSettingsFooter';
import { ReportSettingsNotice } from './ReportSettingsNotice';
import { ReportSettingsSkeleton } from './ReportSettingsSkeleton';
import { ReportSettingsTabsSection } from './ReportSettingsTabsSection';
import { ReportSettingsTopBar } from './ReportSettingsTopBar';

/**
 * «Настройки отчёта» — отдельная страница приложения на всю ширину, без
 * обвязки отчёта: вкладки отчёта, графики и бейджи списка разборов для ВСЕХ
 * сотрудников портала. Менять может руководитель группы и выше; остальным —
 * пояснение вместо формы. Пока настройки грузятся — скелет; не загрузились —
 * сообщение с повтором.
 */
export const ReportSettingsPage = () => {
    const settings = useReportSettingsForm();
    const { portal, canEdit, form } = settings;
    const { options } = portal;

    const body = (() => {
        if (!portal.loaded) return <ReportSettingsSkeleton />;
        if (portal.loadFailed || !options) {
            return <ReportSettingsNotice kind="error" onRetry={settings.retryLoad} />;
        }
        if (!canEdit) return <ReportSettingsNotice kind="forbidden" />;
        return (
            <div className="max-w-3xl space-y-4">
                <ReportSettingsTabsSection
                    tabs={options.tabs}
                    hiddenTabs={form.hiddenTabs}
                    onChange={settings.setTabVisible}
                />
                <ReportSettingsChartsSection
                    enabled={form.chartsEnabled}
                    onChange={settings.setChartsEnabled}
                />
                <ReportSettingsBadgesSection
                    options={options}
                    form={form}
                    canTurnOff={settings.canTurnBadgeOff}
                    onChange={settings.setBadgeMain}
                    onReset={settings.resetBadges}
                />
                <ReportSettingsFooter
                    dirty={settings.dirty}
                    saving={portal.saving}
                    saved={settings.saved}
                    error={portal.error}
                    lastChange={lastChangeText(portal.view)}
                    onSave={settings.save}
                />
            </div>
        );
    })();

    return (
        <div className="space-y-3">
            <ReportSettingsTopBar />
            {body}
        </div>
    );
};
