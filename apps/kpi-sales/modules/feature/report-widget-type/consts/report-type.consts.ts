export enum EReportType {
    All = 'all',
    EVENTS = 'events',
    CALLINGS = 'callings',
    MERGED = 'merged',
}
export const REPORT_TYPE_LABELS = {
    [EReportType.EVENTS]: 'События',
    [EReportType.CALLINGS]: 'Звонки',
    [EReportType.MERGED]: 'Объединенный отчет',
    [EReportType.All]: 'Все',
} as const;
