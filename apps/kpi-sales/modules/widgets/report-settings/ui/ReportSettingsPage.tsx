'use client';

import { useReportSettingsForm } from '../hooks/use-report-settings-form';
import { ReportSettingsForm } from './ReportSettingsForm';
import { ReportSettingsFrame } from './ReportSettingsFrame';
import { ReportSettingsNotice } from './ReportSettingsNotice';
import { ReportSettingsSkeleton } from './ReportSettingsSkeleton';

/**
 * «Настройки отчёта» — отдельная страница приложения на всю ширину, без
 * обвязки отчёта: настройки вида отчёта и списка разборов для ВСЕХ сотрудников
 * портала, по разделам (ReportSettingsForm). Сверху облегчённая шапка со
 * стрелкой «назад» и ряд вкладок (ReportSettingsFrame). Менять может
 * руководитель группы и выше; остальным — пояснение вместо формы. Пока
 * настройки грузятся — скелет; не загрузились — сообщение с повтором.
 */
export const ReportSettingsPage = () => {
    const settings = useReportSettingsForm();
    const { portal, canEdit } = settings;
    const { options } = portal;

    const body = (() => {
        if (!portal.loaded) return <ReportSettingsSkeleton />;
        if (portal.loadFailed || !options) {
            return <ReportSettingsNotice kind="error" onRetry={settings.retryLoad} />;
        }
        if (!canEdit) return <ReportSettingsNotice kind="forbidden" />;
        return <ReportSettingsForm settings={settings} options={options} />;
    })();

    return <ReportSettingsFrame>{body}</ReportSettingsFrame>;
};
