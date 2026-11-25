import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';

/**
 * На каких вкладках в панели главного фильтра есть раздел «Действия».
 *
 * Выбор действий меняет только таблицы событий: «Все», «События»,
 * «Объединённый» (колонки показателей событий). «Звонки» читают статистику
 * звонков, «Дайджест», «Финансы» и «AI аналитика» — свои запросы: выбор
 * действий на них ни на что не влияет, и показывать раздел незачем.
 *
 * Record по всему EReportType: новая вкладка не соберётся, пока для неё
 * не решено, нужен ли ей раздел.
 */
export const ACTIONS_FILTER_TABS: Readonly<Record<EReportType, boolean>> = {
    [EReportType.All]: true,
    [EReportType.EVENTS]: true,
    [EReportType.MERGED]: true,
    [EReportType.CALLINGS]: false,
    [EReportType.DIGEST]: false,
    [EReportType.FINANCE]: false,
    [EReportType.AI]: false,
};

/** Показывать ли в панели фильтра раздел «Действия» на вкладке. */
export const isActionsFilterVisibleOnTab = (type: EReportType): boolean =>
    ACTIONS_FILTER_TABS[type];
