import type { Intent } from '@workspace/april-ui';
import type { ConversionStep } from './conversion-calc.util';

/**
 * Раскраска конверсии относительно медианы команды (не абсолютные пороги —
 * «нормальный» % у каждой пары показателей свой).
 */
export const CONVERSION_INTENT_THRESHOLDS = {
    /** ≥ 115% медианы — заметно лучше команды. */
    success: 1.15,
    /** < 70% медианы — заметно хуже команды. */
    destructive: 0.7,
} as const;

/**
 * Intent значения конверсии: success / warning / destructive / null
 * (нейтрально). null и при отсутствии медианы или значения.
 */
export const getConversionIntent = (
    step: ConversionStep | undefined,
    medianStep: ConversionStep | undefined,
): Intent | null => {
    const percent = step?.percent;
    const median = medianStep?.percent;
    if (percent === null || percent === undefined) return null;
    if (median === null || median === undefined || median === 0) return null;
    const ratio = percent / median;
    if (ratio >= CONVERSION_INTENT_THRESHOLDS.success) return 'success';
    if (ratio >= 1) return null;
    if (ratio < CONVERSION_INTENT_THRESHOLDS.destructive) return 'destructive';
    return 'warning';
};

/** Токен-классы текста по intent (без hex и bg — для строк в ячейках). */
export const CONVERSION_TEXT_CLASS: Record<Intent, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    accent: 'text-accent-foreground',
    muted: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
    destructive: 'text-destructive',
};

export const conversionTextClass = (intent: Intent | null): string =>
    intent ? CONVERSION_TEXT_CLASS[intent] : 'text-muted-foreground';
