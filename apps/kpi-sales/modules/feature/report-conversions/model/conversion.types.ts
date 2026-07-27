/**
 * Конверсии между показателями отчёта.
 *
 * Коды показателей — коды RatingDataset (innerCode у KPI-событий,
 * String(calling.id) у звонковых), поэтому string, не FilterInnerCode.
 */
export type ConversionMethod = 'chain' | 'fromBase';

/** Источник датасета/набора показателей. */
export type ConversionScope = 'kpi' | 'callings' | 'merged';

export interface ConversionChainConfig {
    method: ConversionMethod;
    /** Упорядоченные коды показателей цепочки. */
    codes: string[];
}

export interface ConversionTableConfig extends ConversionChainConfig {
    /** Показывать % внутри основной таблицы. */
    enabled: boolean;
    /** Раскрыта ли полоска настроек над таблицей. */
    settingsOpen: boolean;
}

/**
 * Виджет конверсий: показ/скрытие блока живёт в ReportBlockWrapper
 * (BlockState), здесь — только цепочка и метод.
 */
export type ConversionWidgetConfig = ConversionChainConfig;

export interface ConversionsState {
    version: 1;
    /** Гидратация из персиста прошла — можно автосохранять. */
    hydrated: boolean;
    /** % внутри основных таблиц — своя конфигурация на каждый scope. */
    table: Record<ConversionScope, ConversionTableConfig>;
    /** Виджет конверсий — своя цепочка на каждый scope. */
    widget: Record<ConversionScope, ConversionWidgetConfig>;
    /**
     * @deprecated Вкладка «Конверсии» удалена — консумеры (Excel, user
     * report, share) переведены на widget[scope]. Поле остаётся, чтобы
     * старые персист-блобы ui-settings гидрировались без ошибок.
     */
    tab: ConversionChainConfig;
}

/** Сериализуемая часть состояния (без hydrated) — то, что персистится. */
export type PersistedConversions = Omit<ConversionsState, 'hydrated'>;
