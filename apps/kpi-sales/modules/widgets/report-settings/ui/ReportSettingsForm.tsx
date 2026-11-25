'use client';

import { useState } from 'react';
import { SectionNav } from '@workspace/april-ui';
import type { PortalViewOptions } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import type { useReportSettingsForm } from '../hooks/use-report-settings-form';
import { lastChangeText } from '../lib/report-settings-format';
import {
    REPORT_SETTINGS_DEFAULT_SECTION,
    isReportSettingsSection,
    reportSettingsNavItems,
    type ReportSettingsSection,
} from '../lib/report-settings-sections';
import { ReportSettingsBadgesSection } from './ReportSettingsBadgesSection';
import { ReportSettingsFooter } from './ReportSettingsFooter';
import { ReportSettingsReportSection } from './ReportSettingsReportSection';

const NAV_ITEMS = reportSettingsNavItems();

interface ReportSettingsFormProps {
    settings: ReturnType<typeof useReportSettingsForm>;
    options: PortalViewOptions;
}

/**
 * Форма настроек по разделам: слева список разделов, справа открытый раздел
 * на всю оставшуюся ширину, под ним строка «Сохранить». На узком экране
 * список разделов становится рядом кнопок над содержимым. Ширина ограничена
 * только на очень широких окнах — в окне портала страница занята целиком.
 *
 * Форма одна на все разделы: переключение раздела несохранённые правки не
 * теряет, «Сохранить» сохраняет всё сразу. Список разделов прилипает под
 * шапкой страницы, пока прокручивается длинный раздел.
 */
export const ReportSettingsForm = ({ settings, options }: ReportSettingsFormProps) => {
    const [section, setSection] = useState<ReportSettingsSection>(
        REPORT_SETTINGS_DEFAULT_SECTION,
    );
    const { portal, form } = settings;

    return (
        <div className="flex max-w-[1600px] flex-col gap-4 md:flex-row md:gap-6">
            <SectionNav
                items={NAV_ITEMS}
                current={section}
                onSelect={code => {
                    if (isReportSettingsSection(code)) setSection(code);
                }}
                ariaLabel={REPORT_SETTINGS_TEXT.sections.navLabel}
                className="md:sticky md:top-20 md:w-60 md:shrink-0 md:self-start"
            />
            <div className="min-w-0 flex-1 space-y-4">
                {section === 'report' ? (
                    <ReportSettingsReportSection
                        tabs={options.tabs}
                        hiddenTabs={form.hiddenTabs}
                        chartsEnabled={form.chartsEnabled}
                        onTabChange={settings.setTabVisible}
                        onChartsChange={settings.setChartsEnabled}
                    />
                ) : (
                    <ReportSettingsBadgesSection
                        options={options}
                        form={form}
                        canTurnOff={settings.canTurnBadgeOff}
                        onChange={settings.setBadgeMain}
                        onReset={settings.resetBadges}
                    />
                )}
                <ReportSettingsFooter
                    dirty={settings.dirty}
                    saving={portal.saving}
                    saved={settings.saved}
                    error={portal.error}
                    lastChange={lastChangeText(portal.view)}
                    onSave={settings.save}
                />
            </div>
        </div>
    );
};
