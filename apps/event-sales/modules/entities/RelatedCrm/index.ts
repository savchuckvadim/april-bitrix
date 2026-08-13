// Публичная поверхность сущности «связи клиента в CRM».
export * from './model';
export { useRelatedCrm } from './lib/hooks/use-related-crm';
export type { RelatedCrmData } from './lib/hooks/use-related-crm';
export {
    dealAmount,
    stageColor,
    stageProgress,
    stagePositionLabel,
} from './lib/stage-view';
export { getLeadStatusView, isLeadOpen } from './lib/lead-status-view';
export type { LeadStatusView, LeadSemantic } from './lib/lead-status-view';
export {
    resolveTaskRelation,
    MAX_RELATION_DEALS,
} from './lib/resolve-task-relation';
export type { TaskRelation, RelationDeal } from './lib/resolve-task-relation';
// Сделки, привязанные к задачам (наполняются листенером setFetchedTasks)
export { taskDealsReducer, taskDealsActions } from './model/TaskDealsSlice';
export { fetchTaskBoundDeals } from './model/TaskDealsThunk';
export { StageMini } from './ui/StageMini';
export { DealStageBar } from './ui/DealStageBar';
export { LeadStageBar } from './ui/LeadStageBar';
export {
    useLeadStageDict,
    findLeadStageIndex,
} from './lib/hooks/use-lead-stage-dict';
export type { LeadStageDictItem } from './lib/hooks/use-lead-stage-dict';
export { RelationMini } from './ui/RelationMini';
export { RelationDealBars } from './ui/RelationDealBars';
export { RelationsBar } from './ui/RelationsBar';
export { buildRelationsBar, MAX_RELATION_BARS } from './lib/relations-bar';
export type { RelationsBarView } from './lib/relations-bar';
export { EntityLink } from './ui/EntityLink';
export { getEntityCardUrl, getEntityCardPath } from './lib/entity-url';
export { useCurrentRelations } from './lib/hooks/use-current-relations';
export type { CurrentRelations } from './lib/hooks/use-current-relations';
export { getEntityDescriptor } from './lib/entity-descriptor';
export type { EntityDescriptor } from './lib/entity-descriptor';
export { getFinishTarget } from './lib/finish-target';
export type { FinishTarget } from './lib/finish-target';
export { useOpenEntityCard } from './lib/hooks/use-open-entity-card';
