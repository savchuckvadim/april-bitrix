/**
 * Публичная поверхность раздела «Анкеты» портала.
 *
 * Наружу отдаются доменные типы, хуки и чистые функции сборки/проверки
 * черновика. Транспорт (`lib/api/*-helper.ts`) остаётся внутри слайса:
 * `@workspace/nest-admin-api` за его пределами не импортируется.
 *
 * Из UI наружу отдаются экран каталога и редактор анкеты — обоим нужен
 * только `portalId` (редактору ещё идентификатор анкеты из адреса).
 */
export * from './model';
export * from './lib/hooks';
export * from './ui';
export {
    addLiveOptionToItem,
    applyFieldToItem,
    buildItemFromField,
    buildItemCodeFromFieldName,
    getFieldControls,
    getFieldRejectReason,
    syncFieldInItem,
    uniqueItemCode,
} from './lib/build-item-from-field';
export type {
    BuildItemFromFieldOptions,
    QuestionnaireFieldOrigin,
} from './lib/build-item-from-field';
export {
    QUESTIONNAIRE_EVENT_TYPE_KINDS,
    QUESTIONNAIRE_SMART_BINDINGS,
    findPortalSmart,
    findSmartBindingByEventType,
    findSmartBindingByTypeGroup,
    isQuestionnaireReachableForSmart,
} from './lib/event-smart-registry';
export type { QuestionnaireSmartBinding } from './lib/event-smart-registry';
export { describeSmartTarget } from './lib/smart-target-view';
export type { QuestionnaireSmartTarget } from './lib/smart-target-view';
export {
    QUESTIONNAIRE_EVENT_SWITCH_CODE,
    findQuestionnaireEventSwitch,
    formatDisabledEventTypes,
    isQuestionnaireSilencedByEventTypes,
    parseDisabledEventTypes,
    toggleDisabledEventType,
} from './lib/questionnaire-event-switch';
export type { QuestionnaireEventSwitch } from './lib/questionnaire-event-switch';
export { buildCommentItem } from './lib/build-comment-item';
export {
    createQuestionnaireDraft,
    defaultPlaceForPurpose,
    isSameQuestionnaireDraft,
    shouldReplaceDraft,
    toQuestionnaireDraft,
    withItemOrder,
} from './lib/questionnaire-draft';
export { prepareQuestionnaireSave } from './lib/prepare-save-payload';
export { describeQuestionnairePreview } from './lib/conditions-preview';
export {
    findQuestionnaireCodeConflict,
    toLatinSlug,
    toQuestionnaireCode,
} from './lib/questionnaire-code';
export {
    getFieldStatusProblem,
    getItemControlOptions,
    getRequireChangeLock,
    getStaleAfterDaysLock,
    getTargetEntityLock,
    issuesForItem,
    withGroupDividers,
} from './lib/item-editor-view';
export type {
    QuestionnaireFieldProblem,
    QuestionnaireItemRow,
} from './lib/item-editor-view';
export {
    buildFieldPickerRows,
    buildFieldSourceOptions,
    countSelectableRows,
    describeDegradedNotice,
    describeFieldUsage,
    describeSmartSource,
    describeSourceNotice,
    fieldSourceKey,
} from './lib/field-picker-view';
export type {
    QuestionnaireFieldFilters,
    QuestionnaireFieldNotice,
    QuestionnaireFieldRow,
    QuestionnaireFieldSourceOption,
} from './lib/field-picker-view';
export {
    FIELD_CODE_MAX_LENGTH,
    addFieldOption,
    applyFieldTitle,
    buildFieldCreatePayload,
    buildFieldTypeOptions,
    createFieldDraft,
    describeFieldCreateBlockReason,
    describeFieldCreateProblem,
    needsFieldOptions,
    nextFieldOptionKey,
    toFieldCode,
} from './lib/field-create-view';
export type {
    QuestionnaireFieldCreateDraft,
    QuestionnaireFieldCreateOption,
    QuestionnaireFieldTypeOption,
} from './lib/field-create-view';
export {
    QUESTIONNAIRE_FIELD_MIRROR_KEY,
    acceptLiveFieldPatch,
    acceptLiveOptionMeta,
    adoptLiveOptionTitlePatch,
    adoptLiveTitlePatch,
    bindFieldMirror,
    buildLiveFieldView,
    readFieldMirror,
    toFieldMirrorState,
    writeFieldMirror,
} from './lib/field-mirror';
export type {
    QuestionnaireFieldMirror,
    QuestionnaireFieldMirrorOption,
    QuestionnaireFieldMirrorState,
    QuestionnaireLiveFieldView,
    QuestionnaireLiveOption,
    QuestionnaireLostOption,
} from './lib/field-mirror';
export { buildCheckSummary } from './lib/check-result-view';
export type {
    QuestionnaireCheckRow,
    QuestionnaireCheckStatusCount,
    QuestionnaireCheckSummary,
} from './lib/check-result-view';
export {
    buildFieldSyncReport,
    canAdoptCheckedQuestionnaire,
    countDiffLines,
    describeFieldSyncResult,
    getFieldSyncBlockReason,
    syncPickKey,
} from './lib/field-sync-view';
export type {
    QuestionnaireAdoptDecision,
    QuestionnaireFieldSyncReport,
    QuestionnaireSyncItem,
    QuestionnaireSyncKind,
    QuestionnaireSyncLine,
    QuestionnaireSyncPicks,
} from './lib/field-sync-view';
export type { QuestionnaireDraft } from './lib/questionnaire-draft';
export { validateQuestionnaireDraft } from './lib/validate-questionnaire-draft';
export type {
    QuestionnaireDraftIssue,
    QuestionnaireIssueScope,
    ValidateQuestionnaireDraftOptions,
} from './lib/validate-questionnaire-draft';
export { getQuestionnaireErrorMessage } from './lib/questionnaire-error';
export {
    buildQuestionnaireRows,
    describeConditions,
    describePlace,
    formatUpdatedAt,
    optionName,
} from './lib/questionnaire-list-view';
export type {
    QuestionnaireConditionChip,
    QuestionnaireRow,
} from './lib/questionnaire-list-view';
export { buildQuestionnaireMatrix } from './lib/questionnaire-matrix';
export type {
    QuestionnaireMatrix,
    QuestionnaireMatrixCard,
    QuestionnaireMatrixCell,
    QuestionnaireMatrixColumn,
    QuestionnaireMatrixGroup,
    QuestionnaireMatrixLooseCard,
    QuestionnaireMatrixLooseReason,
    QuestionnaireMatrixRow,
} from './lib/questionnaire-matrix';
export {
    QUESTIONNAIRE_PRESET_PARAM,
    parseQuestionnairePreset,
    questionnairePresetSearch,
} from './lib/questionnaire-preset';
export type { QuestionnairePreset } from './lib/questionnaire-preset';
export {
    buildToggleActivePayload,
    getToggleActiveBlockReason,
} from './lib/toggle-active-payload';
export {
    QUESTIONNAIRES_TEXT,
    QUESTIONNAIRE_EDITOR_TEXT,
    QUESTIONNAIRE_ITEM_FLAG_TEXT,
    QUESTIONNAIRE_MATRIX_TEXT,
    QUESTIONNAIRE_NEW_ID,
    QUESTIONNAIRE_PURPOSE_COLUMN_TEXT,
    QUESTIONNAIRE_VIEW,
} from './consts/questionnaires.const';
export type { QuestionnaireView } from './consts/questionnaires.const';
