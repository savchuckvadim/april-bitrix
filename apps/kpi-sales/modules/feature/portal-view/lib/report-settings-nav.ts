import { REPORT_SETTINGS_PATH } from '../consts/portal-view.consts';

/** Параметр адреса настроек: с какой страницы их открыли (нужно кнопке «назад»). */
export const REPORT_SETTINGS_FROM_PARAM = 'from';

/** Откуда открывают настройки отчёта: из отчёта или из «Разборов звонков». */
export const REPORT_SETTINGS_FROM = ['report', 'calls'] as const;
export type ReportSettingsFrom = (typeof REPORT_SETTINGS_FROM)[number];

/** Адрес страницы настроек с пометкой, откуда пришли: `/settings?from=calls`. */
export const reportSettingsHref = (from: ReportSettingsFrom): string =>
    `${REPORT_SETTINGS_PATH}?${REPORT_SETTINGS_FROM_PARAM}=${from}`;

/** Пометка «откуда пришли» из адреса страницы; пустая или незнакомая — null. */
export const parseReportSettingsFrom = (
    value: string | null | undefined,
): ReportSettingsFrom | null =>
    REPORT_SETTINGS_FROM.find(from => from === value) ?? null;
