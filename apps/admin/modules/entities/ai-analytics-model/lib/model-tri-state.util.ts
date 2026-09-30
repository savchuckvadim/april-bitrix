import type { StatusTone } from '@workspace/april-ui/tones';
import type { ModelTriStateLabels } from './model-view.types';

/** Три состояния флага: да, нет, не считалось (null ≠ «нет»). */
export const triStateOf = (
    value: boolean | null | undefined,
    labels: ModelTriStateLabels,
): { value: string; tone: StatusTone } => {
    if (value === true) return { value: labels.yes, tone: 'success' };
    if (value === false) return { value: labels.no, tone: 'destructive' };
    return { value: labels.unknown, tone: 'muted' };
};

/** Подписи «да / нет / не считалось» по умолчанию. */
export const YES_NO_UNKNOWN: ModelTriStateLabels = {
    yes: 'да',
    no: 'нет',
    unknown: 'не считалось',
};
