/**
 * Единый реестр тонов дизайн-системы April.
 *
 * До него в монорепе жили ТРИ параллельные ручные таблицы «значение →
 * className» с байт-идентичными тройками success/warning/destructive
 * (EVENT_STATUS_BADGE, COLOR_CLASS прогноза компании, RESULT_BADGES).
 * Любая правка цвета требовала обойти их все. Теперь таблица одна.
 *
 * Правила:
 * - только токены тем (packages/ui/src/styles/themes/april-tokens.css),
 *   никаких сырых палитр вида bg-blue-500;
 * - классы записаны СТРОКОВЫМИ ЛИТЕРАЛАМИ целиком: Tailwind v4 сканирует
 *   исходники статически и склеенную строку `bg-${tone}` не увидит;
 * - тон `event` намеренно не фиксирует цвет — он берётся из ближайшего
 *   контейнера с data-event-type через реактивный токен --event-current.
 */

/** Статусы, общие для всех приложений. */
export type StatusTone =
    /** Без спец-цвета: обычный текст, обычная рамка. */
    | 'neutral'
    /** Явно приглушённый: подписи, второстепенные значения. */
    | 'muted'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'info';

/**
 * Типы событий. `event` — «текущий тип», наследуется от data-event-type;
 * остальные фиксируют конкретный цвет.
 */
export type EventTone =
    | 'event'
    | 'event-cold'
    /** Холодный, но с заявкой — «особый» тип. Цвет предварительный. */
    | 'event-lead'
    | 'event-warm'
    | 'event-pres'
    | 'event-hot'
    | 'event-money'
    | 'event-ss'
    | 'event-supply';

/**
 * Комплекты конструктора (--complect-* в april-tokens.css). `complect` —
 * «текущий комплект», наследуется от data-complect так же, как event от
 * data-event-type.
 */
export type ComplectTone =
    | 'complect'
    | 'complect-buh'
    | 'complect-ur'
    | 'complect-expert'
    | 'complect-office'
    | 'complect-universal';

export type Tone = StatusTone | EventTone | ComplectTone;

/**
 * Заливка + контрастный текст. Для destructive это `text-white`, а не
 * `text-destructive-foreground`: в этой репе --destructive-foreground сам
 * красный (globals.css), поэтому текст стал бы невидимым. Так же поступают
 * штатные shadcn badge.tsx и button.tsx — не «чинить».
 */
export const TONE_SOLID: Record<Tone, string> = {
    neutral: 'bg-muted text-foreground',
    muted: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-white',
    info: 'bg-info text-info-foreground',

    event: 'bg-event-current text-event-current-foreground',
    'event-lead': 'bg-event-lead text-event-lead-foreground',
    'event-cold': 'bg-event-cold text-event-cold-foreground',
    'event-warm': 'bg-event-warm text-event-warm-foreground',
    'event-pres': 'bg-event-pres text-event-pres-foreground',
    'event-hot': 'bg-event-hot text-event-hot-foreground',
    'event-money': 'bg-event-money text-event-money-foreground',
    'event-ss': 'bg-event-ss text-event-ss-foreground',
    'event-supply': 'bg-event-supply text-event-supply-foreground',

    complect: 'bg-complect-current text-complect-current-foreground',
    'complect-buh': 'bg-complect-buh text-complect-buh-foreground',
    'complect-ur': 'bg-complect-ur text-complect-ur-foreground',
    'complect-expert': 'bg-complect-expert text-complect-expert-foreground',
    'complect-office': 'bg-complect-office text-complect-office-foreground',
    'complect-universal':
        'bg-complect-universal text-complect-universal-foreground',
};

/** Приглушённая подложка + цветной текст: мягкие бэйджи, подсветки строк. */
export const TONE_SOFT: Record<Tone, string> = {
    neutral: 'bg-muted text-foreground',
    muted: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent/60 text-accent-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info',

    event: 'bg-event-current/10 text-event-current',
    'event-lead': 'bg-event-lead/10 text-event-lead',
    'event-cold': 'bg-event-cold/10 text-event-cold',
    'event-warm': 'bg-event-warm/10 text-event-warm',
    'event-pres': 'bg-event-pres/10 text-event-pres',
    'event-hot': 'bg-event-hot/10 text-event-hot',
    'event-money': 'bg-event-money/10 text-event-money',
    'event-ss': 'bg-event-ss/10 text-event-ss',
    'event-supply': 'bg-event-supply/10 text-event-supply',

    complect: 'bg-complect-current/10 text-complect-current',
    'complect-buh': 'bg-complect-buh/10 text-complect-buh',
    'complect-ur': 'bg-complect-ur/10 text-complect-ur',
    'complect-expert': 'bg-complect-expert/10 text-complect-expert',
    'complect-office': 'bg-complect-office/10 text-complect-office',
    'complect-universal': 'bg-complect-universal/10 text-complect-universal',
};

/** Только текст — заголовки секций, акцентные подписи. */
export const TONE_TEXT: Record<Tone, string> = {
    neutral: 'text-foreground',
    muted: 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    accent: 'text-accent-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    info: 'text-info',

    event: 'text-event-current',
    'event-lead': 'text-event-lead',
    'event-cold': 'text-event-cold',
    'event-warm': 'text-event-warm',
    'event-pres': 'text-event-pres',
    'event-hot': 'text-event-hot',
    'event-money': 'text-event-money',
    'event-ss': 'text-event-ss',
    'event-supply': 'text-event-supply',

    complect: 'text-complect-current',
    'complect-buh': 'text-complect-buh',
    'complect-ur': 'text-complect-ur',
    'complect-expert': 'text-complect-expert',
    'complect-office': 'text-complect-office',
    'complect-universal': 'text-complect-universal',
};

/** Только рамка — кромка карточки, обводка тайла. */
export const TONE_BORDER: Record<Tone, string> = {
    neutral: 'border-border',
    muted: 'border-muted',
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent',
    success: 'border-success',
    warning: 'border-warning',
    destructive: 'border-destructive',
    info: 'border-info',

    event: 'border-event-current',
    'event-lead': 'border-event-lead',
    'event-cold': 'border-event-cold',
    'event-warm': 'border-event-warm',
    'event-pres': 'border-event-pres',
    'event-hot': 'border-event-hot',
    'event-money': 'border-event-money',
    'event-ss': 'border-event-ss',
    'event-supply': 'border-event-supply',

    complect: 'border-complect-current',
    'complect-buh': 'border-complect-buh',
    'complect-ur': 'border-complect-ur',
    'complect-expert': 'border-complect-expert',
    'complect-office': 'border-complect-office',
    'complect-universal': 'border-complect-universal',
};

/** Заливка без текста — точка-статус, полоска прогресса. */
export const TONE_BG: Record<Tone, string> = {
    neutral: 'bg-muted-foreground',
    muted: 'bg-muted',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    info: 'bg-info',

    event: 'bg-event-current',
    'event-lead': 'bg-event-lead',
    'event-cold': 'bg-event-cold',
    'event-warm': 'bg-event-warm',
    'event-pres': 'bg-event-pres',
    'event-hot': 'bg-event-hot',
    'event-money': 'bg-event-money',
    'event-ss': 'bg-event-ss',
    'event-supply': 'bg-event-supply',

    complect: 'bg-complect-current',
    'complect-buh': 'bg-complect-buh',
    'complect-ur': 'bg-complect-ur',
    'complect-expert': 'bg-complect-expert',
    'complect-office': 'bg-complect-office',
    'complect-universal': 'bg-complect-universal',
};

/**
 * Тон состояния формы/секции. Держим отдельно от Tone: у состояния «обычное»
 * цвета нет вовсе, а warning/error обязаны совпадать по всей монорепе.
 */
export type ToneState = 'default' | 'disabled' | 'warning' | 'error';

export const STATE_TONE: Record<Exclude<ToneState, 'default' | 'disabled'>, Tone> =
    {
        warning: 'warning',
        error: 'destructive',
    };
