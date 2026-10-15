/** Плитка итога (сводка дня, презентации, продажи): данные без вёрстки. */
export interface DigestTileData {
    key: string;
    label: string;
    value: string;
    sub?: string;
    /** Токен-класс акцента подписи (text-success и т.п.). */
    accent: string;
}
