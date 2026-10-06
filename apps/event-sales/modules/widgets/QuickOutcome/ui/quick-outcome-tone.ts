import { QUICK_OUTCOME, type QuickOutcomeKind } from '../lib/quick-outcome';

/** Цвет подписи кнопки итога — по смыслу итога; фон общий с соседними. */
export const QUICK_OUTCOME_TONE_CLASS: Record<QuickOutcomeKind, string> = {
    [QUICK_OUTCOME.sale]: 'text-success hover:text-success',
    [QUICK_OUTCOME.fail]: 'text-destructive hover:text-destructive',
};
