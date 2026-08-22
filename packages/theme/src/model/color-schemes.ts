/*
 * Цветовые схемы и пресеты масштаба — общие константы темы.
 *
 * Вынесены из provider/Theme.tsx отдельным модулем сознательно: тот помечен
 * 'use client', а список схем нужен ещё и инлайн-скрипту инициализации, который
 * обязан быть серверным (он и существует ради того, чтобы отработать до
 * гидратации). Публичная поверхность не изменилась — provider реэкспортирует.
 */

export type ColorScheme =
    | 'default'
    | 'blue'
    | 'violet'
    | 'pink'
    | 'green'
    | 'yellow'
    | 'orange'
    | 'red'
    | 'bx'
    | 'beige'
    | 'explosive-pink'
    | 'air'
    | 'claude';

export const ColorSchemes = [
    'default',
    'blue',
    'violet',
    'pink',
    'green',
    'yellow',
    'orange',
    'red',
    'bx',
    'beige',
    'explosive-pink',
    'air',
    'claude',
] as const;

/**
 * Цвет-превью схемы для свотча в переключателе.
 *
 * Приходится держать значения здесь: сами темы объявлены селектором
 * `:root.<схема>-<режим>`, поэтому применить класс схемы к маленькому
 * квадратику и взять её `--primary` нельзя — переменные живут только на
 * корне документа. Ключи типизированы `ColorScheme`, так что забытая схема
 * не проедет мимо компилятора.
 */
export const COLOR_SCHEME_SWATCH: Record<ColorScheme, string> = {
    default: '#1E293B',
    blue: '#3B82F6',
    violet: '#8B5CF6',
    pink: '#d6409f',
    green: '#46a758',
    yellow: '#ffc53d',
    orange: '#f76b15',
    red: '#EF4444',
    bx: '#30c3ef',
    beige: '#F5F3F0',
    'explosive-pink': '#bb52d4',
    air: '#3773e0',
    claude: '#D97757',
};

/*
 * Пресеты масштаба UI — см. packages/ui/src/styles/tokens/density.css.
 *
 * Порядок — от мелкого к крупному, на него опирается шаг −/+ в ScaleToggler.
 * `dense` добавлен под встройки-вкладки: там приложению отведён блок около
 * 630×600, и даже 14px съедают экран быстрее, чем помещается работа.
 */
export type UIScale = 'dense' | 'compact' | 'comfortable' | 'large' | 'xl';
export const UIScales = [
    'dense',
    'compact',
    'comfortable',
    'large',
    'xl',
] as const;

/**
 * Множители пресетов. Единственный источник — здесь: и CSS-переменная, и
 * подпись «85%» в тогглере считаются от него, иначе они разъезжаются.
 */
export const UI_SCALE_FACTOR: Record<UIScale, number> = {
    dense: 0.8125, // 13px — как собственный интерфейс Bitrix24
    compact: 0.875, // 14px
    comfortable: 1, // 16px
    large: 1.125, // 18px
    xl: 1.25, // 20px
};
