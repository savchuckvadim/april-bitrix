import { FEEDBACK_KIND_LABEL } from '../consts/ai-analytics-model.labels.const';
import type {
    ModelFeedbackKind,
    ModelFeedbackManager,
    ModelFeedbackResult,
} from '../model';
import { codeViewOf, type ModelCodeView } from './model-code-label.util';
import { formatCount, formatDay, formatPercent } from './model-format.util';
import type { ModelMetricView } from './model-view.types';

/** Строка разреза по видам записей. */
export interface FeedbackKindRow extends ModelCodeView {
    count: string;
}

/** Строка разреза по менеджерам: реакции витрины отдельно, прочее — одной суммой. */
export interface FeedbackManagerRow {
    key: string;
    manager: string;
    total: string;
    useful: string;
    notUseful: string;
    disagree: string;
    other: string;
}

export interface FeedbackView {
    period: string;
    metrics: ModelMetricView[];
    kinds: FeedbackKindRow[];
    managers: FeedbackManagerRow[];
    /** В периоде нет ни одной записи — даже заменённой или чужой формы. */
    isEmpty: boolean;
}

const countOf = (
    manager: ModelFeedbackManager,
    kind: ModelFeedbackKind,
): number =>
    manager.byKind
        .filter(item => item.kind === kind)
        .reduce((sum, item) => sum + item.count, 0);

const managerRowOf = (manager: ModelFeedbackManager): FeedbackManagerRow => {
    const useful = countOf(manager, 'useful');
    const notUseful = countOf(manager, 'not_useful');
    const disagree = countOf(manager, 'disagree');
    return {
        key: manager.managerId ?? 'none',
        manager:
            manager.managerId === null
                ? 'Без менеджера'
                : `Менеджер ${manager.managerId}`,
        total: formatCount(manager.total),
        useful: formatCount(useful),
        notUseful: formatCount(notUseful),
        disagree: formatCount(disagree),
        other: formatCount(
            Math.max(0, manager.total - useful - notUseful - disagree),
        ),
    };
};

/** Сводка обратной связи → карточка: итоги, разрез по видам и менеджерам. */
export const toFeedbackView = (result: ModelFeedbackResult): FeedbackView => {
    const kinds = [...result.byKind]
        .sort((left, right) => right.count - left.count)
        .map(item => ({
            ...codeViewOf(FEEDBACK_KIND_LABEL, item.kind),
            count: formatCount(item.count),
        }));

    return {
        period: `${formatDay(result.from)} – ${formatDay(result.to)}`,
        metrics: [
            { label: 'Всего записей', value: formatCount(result.total) },
            {
                label: 'Доля «полезно»',
                value:
                    result.usefulRatePct === null
                        ? 'оценок не было'
                        : formatPercent(result.usefulRatePct),
                hint: 'Полезно от суммы «полезно», «не полезно» и «не согласен».',
            },
            {
                label: 'Заменённых',
                value: formatCount(result.superseded),
                hint: 'Смена оценки в тот же день и повторная метка руководителя. В счётчики и долю не входят.',
            },
            {
                label: 'Чужой формы',
                value: formatCount(result.skipped),
                hint: 'Записи без распознанного вида. В счётчики не входят, показаны, чтобы потеря не пряталась.',
            },
        ],
        kinds,
        managers: result.byManager.map(managerRowOf),
        isEmpty:
            result.total === 0 && result.superseded === 0 && result.skipped === 0,
    };
};
