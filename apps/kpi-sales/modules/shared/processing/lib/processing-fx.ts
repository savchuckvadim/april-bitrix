/**
 * Данные Processing-экранов: тексты, длительность таймера и fx-палитры
 * градиентов/фонов (по правилу «данные отдельно от UI»).
 * Hex здесь — осознанно: это параметры WebGL/градиент-эффектов
 * (как DEFAULT_GRADIENT у PreloaderScreen), а не цвета интерфейса.
 */

export const PROCESSING_DURATION_SEC = 60;

/** Ключ персиста старта таймера — переживает ремаунт экрана. */
export const PROCESSING_TIMER_KEY = 'kpi-report-processing';

export const PROCESSING_TEXTS = {
    title: 'Мы конструируем отчёт для Вас',
    subtitle: 'Это может занять до нескольких минут. Подождите пожалуйста',
    almostReady: 'Почти готово',
} as const;

/** Градиент цифр и кольца нового таймера. */
export const TIMER_GRADIENT = ['#bb52d4', '#7c5cff', '#30c3ef', '#bb52d4'];

/** Градиент заголовка на fx-вариантах страницы. */
export const TITLE_GRADIENT = ['#bb52d4', '#30c3ef', '#bb52d4', '#30c3ef'];

/** Aurora (ReactBits) — стопы северного сияния. */
export const AURORA_COLOR_STOPS = ['#bb52d4', '#30c3ef', '#2868d4'];

/** LiquidEther (ReactBits) — палитра жидкости. */
export const LIQUID_COLORS = ['#5227FF', '#FF9FFC', '#B19EEF'];

/** ColorBends (ReactBits) — палитра переливов. */
export const BENDS_COLORS = ['#bb52d4', '#30c3ef', '#7c5cff'];
