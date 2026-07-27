// Вкладка «Конверсии» удалена: конверсии живут блоками внутри вкладок
// (widgets/conversions-block) с разбивкой по отделам/группам и рейтингами.
export enum EReportType {
    All = 'all',
    EVENTS = 'events',
    CALLINGS = 'callings',
    MERGED = 'merged',
    FINANCE = 'finance',
}
export const REPORT_TYPE_LABELS = {
    [EReportType.EVENTS]: 'События',
    [EReportType.CALLINGS]: 'Звонки',
    [EReportType.MERGED]: 'Объединенный отчет',
    [EReportType.FINANCE]: 'Финансы',
    [EReportType.All]: 'Все',
} as const;
