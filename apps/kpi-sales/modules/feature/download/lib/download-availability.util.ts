import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
// Прямой путь (не барель фичи): нужна одна чистая функция.
import { getReportDataNeeds } from '@/modules/feature/report-flow/lib/report-data-needs.util';

/** Состояние источника данных отчёта: идёт ли загрузка и приходил ли ответ. */
export interface DownloadSourceState {
    isLoading: boolean;
    isFetched: boolean;
}

export interface DownloadAvailability {
    /** На вкладке есть что выгружать — кнопка показывается. */
    visible: boolean;
    /** Данные для выгрузки загружены — кнопка активна. */
    ready: boolean;
}

const isLoaded = (source: DownloadSourceState): boolean =>
    source.isFetched && !source.isLoading;

/**
 * Можно ли выгрузить отчёт в Excel. Excel — зеркало экрана: вкладки отчёта
 * выгружают события и звонки, «Финансы» — свои листы. У «Дайджеста» и «AI
 * аналитики» выгрузки нет: их данные в Excel не попадают, а события и
 * звонки на этих вкладках не загружаются (запросы идут только для своей
 * вкладки). Пока нужные вкладке данные ещё считаются, кнопка неактивна —
 * иначе в файл ушёл бы пустой отчёт.
 */
export const resolveDownloadAvailability = (
    type: EReportType,
    sources: { events: DownloadSourceState; callings: DownloadSourceState },
): DownloadAvailability => {
    if (type === EReportType.FINANCE) return { visible: true, ready: true };

    const needs = getReportDataNeeds(type);
    if (!needs.events && !needs.callings) {
        return { visible: false, ready: false };
    }
    return {
        visible: true,
        ready:
            (!needs.events || isLoaded(sources.events)) &&
            (!needs.callings || isLoaded(sources.callings)),
    };
};
