import {
    columnLabelKey,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import type { RatingDataset } from './rating.util';

/**
 * Датасет рейтинга для показа: у показателей — выводимые названия по коду
 * (innerCode события или id бакета звонков). Только ПОСЛЕ отборов по
 * названию (applyMergedSelection, состав объединённого отчёта): выбор
 * показателя в рейтинге — по коду, значения и порядок не меняются.
 */
export const labelRatingDataset = (
    dataset: RatingDataset,
    labelOf: IndicatorLabeler,
): RatingDataset => ({
    ...dataset,
    actions: dataset.actions.map(action => ({
        ...action,
        name: labelOf(columnLabelKey(action.code), action.name),
    })),
});
