'use client';

import { ThemeTogglePanel } from '@workspace/theme';
// Прямой путь, не index фичи: нужен только ряд вкладок (без загрузки отчёта).
import { ReportType } from '@/modules/feature/report-widget-type/ui/ReportType';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

/**
 * Верх страницы настроек: ряд вкладок (ни одна не активна — все ведут в отчёт
 * или в «Разборы звонков»), справа переключатель темы, ниже заголовок.
 */
export const ReportSettingsTopBar = () => (
    <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <ReportType page="settings" />
            <ThemeTogglePanel />
        </div>
        <h1 className="text-lg font-semibold">{REPORT_SETTINGS_TEXT.title}</h1>
    </div>
);
