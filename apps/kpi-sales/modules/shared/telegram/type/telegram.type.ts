export enum EnumTelegramApp {
    KPI_SALES = "kpi_sales",
    KONSTRUKTOR = "konstruktor",
}
export interface TelegramSendMessageDto {
    app: EnumTelegramApp;
    text: string;
    domain: string;
    userId: string;
}
