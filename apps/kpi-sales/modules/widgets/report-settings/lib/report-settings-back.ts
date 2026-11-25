// Прямые пути к константам: барели сущности и фич тянут UI и стор.
import { CALLS_LIST_PATH } from '@/modules/entities/calls-list/lib/calls-list.const';
import type { ReportSettingsFrom } from '@/modules/feature/portal-view/lib/report-settings-nav';
import { REPORT_PAGE_PATH } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

/** Куда возвращает стрелка «назад» со страницы настроек. */
export interface ReportSettingsBackTarget {
    /** Адрес страницы — когда шагнуть назад по истории окна нельзя. */
    path: string;
    /** Вторая строка подсказки у стрелки: куда она вернёт. */
    hint: string;
}

const T = REPORT_SETTINGS_TEXT.back;

const BACK_TARGETS: Readonly<Record<ReportSettingsFrom, ReportSettingsBackTarget>> = {
    report: { path: REPORT_PAGE_PATH, hint: T.toReport },
    calls: { path: CALLS_LIST_PATH, hint: T.toCalls },
};

/**
 * Куда вернуться из настроек: на страницу, с которой их открыли. Пометки в
 * адресе нет (страницу открыли напрямую) — в отчёт.
 */
export const reportSettingsBackTarget = (
    from: ReportSettingsFrom | null,
): ReportSettingsBackTarget => BACK_TARGETS[from ?? 'report'];

/**
 * Можно ли вернуться шагом назад по истории окна. Только когда настройки
 * открыли кнопкой приложения (в адресе есть пометка «откуда») и в истории есть
 * предыдущая запись: тогда человек попадает ровно туда, где был, — с теми же
 * фильтрами списка разборов и той же прокруткой. Иначе стрелка ведёт по адресу
 * страницы: шаг по истории увёл бы из приложения или не сделал бы ничего.
 */
export const canStepBackInHistory = (
    from: ReportSettingsFrom | null,
    historyLength: number,
): boolean => from !== null && historyLength > 1;
