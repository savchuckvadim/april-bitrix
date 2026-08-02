/**
 * Данные Processing-экрана: тексты, длительность таймера и fx-палитры
 * (по правилу «данные отдельно от UI»).
 *
 * Hex здесь — осознанно: это параметры градиент/WebGL-эффектов, а не цвета
 * интерфейса. Токены тем сюда не годятся — градиент строится из нескольких
 * стопов и читается JS'ом, а не CSS.
 *
 * Приложение может передать свою палитру пропом `gradient`: у kpi-service
 * та же механика и вёрстка, но свой цвет — чтобы отчёты сервиса и продаж
 * различались с одного взгляда.
 */

export const PROCESSING_DURATION_SEC = 60;

/** Ключ персиста старта таймера — переживает ремаунт экрана. */
export const PROCESSING_TIMER_KEY = 'april-report-processing';

export const PROCESSING_TEXTS = {
    title: 'Мы конструируем отчёт для Вас',
    subtitle: 'Это может занять до нескольких минут. Подождите пожалуйста',
    almostReady: 'Почти готово',
} as const;

/** Градиент цифр и кольца таймера (продажи: фиолет → синий). */
export const TIMER_GRADIENT = ['#bb52d4', '#7c5cff', '#30c3ef', '#bb52d4'];

/** Градиент заголовка на fx-вариантах страницы. */
export const TITLE_GRADIENT = ['#bb52d4', '#30c3ef', '#bb52d4', '#30c3ef'];

/** Сервис: та же механика, свой цвет — бирюза → зелёный. */
export const TIMER_GRADIENT_SERVICE = [
    '#30c3ef',
    '#2ad6b6',
    '#44d590',
    '#30c3ef',
];

export const TITLE_GRADIENT_SERVICE = [
    '#30c3ef',
    '#44d590',
    '#30c3ef',
    '#2ad6b6',
];

/** Aurora (ReactBits) — стопы северного сияния. */
export const AURORA_COLOR_STOPS = ['#bb52d4', '#30c3ef', '#2868d4'];

/** LiquidEther (ReactBits) — палитра жидкости. */
export const LIQUID_COLORS = ['#5227FF', '#FF9FFC', '#B19EEF'];

/** ColorBends (ReactBits) — палитра переливов. */
export const BENDS_COLORS = ['#bb52d4', '#30c3ef', '#7c5cff'];
