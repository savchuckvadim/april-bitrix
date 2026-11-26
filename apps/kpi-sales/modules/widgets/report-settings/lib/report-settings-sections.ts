import type { SectionNavItem } from '@workspace/april-ui';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

/**
 * Разделы страницы настроек — в порядке показа в списке слева. Раздел — экран
 * страницы, а не адрес: форма одна на все разделы, «Сохранить» сохраняет всё.
 * Новый раздел добавляется сюда и в тексты (`REPORT_SETTINGS_TEXT.sections`).
 */
export const REPORT_SETTINGS_SECTIONS = ['report', 'calls', 'indicators'] as const;
export type ReportSettingsSection = (typeof REPORT_SETTINGS_SECTIONS)[number];

/** Раздел, открытый при входе на страницу. */
export const REPORT_SETTINGS_DEFAULT_SECTION: ReportSettingsSection =
    REPORT_SETTINGS_SECTIONS[0];

export const isReportSettingsSection = (
    value: string,
): value is ReportSettingsSection =>
    (REPORT_SETTINGS_SECTIONS as readonly string[]).includes(value);

/** Пункты списка разделов: название и короткое пояснение под ним. */
export const reportSettingsNavItems = (): SectionNavItem[] =>
    REPORT_SETTINGS_SECTIONS.map(section => ({
        code: section,
        label: REPORT_SETTINGS_TEXT.sections[section].title,
        description: REPORT_SETTINGS_TEXT.sections[section].nav,
    }));
