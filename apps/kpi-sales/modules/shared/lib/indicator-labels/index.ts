// Свои названия показателей при показе: ключи `ev:`/`call:`/`plan:` и
// функция названий. Сущности получают её параметром, фичи и виджеты —
// из useIndicatorLabeler() (feature/portal-view).
export {
    CALLING_BUCKET_IDS,
    INDICATOR_LABEL_PREFIX,
    callingLabelKey,
    columnLabelKey,
    eventLabelKey,
    isCallingBucketId,
    planLabelKey,
} from './indicator-label-keys';
export type { CallingBucketId } from './indicator-label-keys';
export {
    createIndicatorLabeler,
    defaultIndicatorLabeler,
    normalizeIndicatorName,
} from './indicator-labeler';
export type { IndicatorLabeler } from './indicator-labeler';
export {
    indicatorColumnLabel,
    labelTableData,
    labelTableRows,
} from './indicator-table-labels';
