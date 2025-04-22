export interface ReportCallingData {
    userId: number;
    userName?: string
    callings: Array<KPICall>
}

export type KPICall = {
    id: CALL_DURATION
    action: CALL_DURATION_NAME
    count: number
    // list?: KPIListItem[]
}
enum CALL_DURATION {
    ALL = 'all',
    HALF = 30,
    MINUTE = 60,
    THREE_MINUTE = 180,
    FIVE_MINUTE = 300,
    PRESENTATION = 600
}

enum CALL_DURATION_NAME {
    ALL = 'Наборов номера',
    HALF = 'Звонки > 30 сек',
    MINUTE = 'Звонки > минуты',
    THREE_MINUTE = 'Звонки > 3 минут',
    FIVE_MINUTE = 'Звонки > 5 минут',
    PRESENTATION = 'Звонки > 10 минут'
}