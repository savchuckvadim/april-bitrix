// Публичная поверхность сущности «связи клиента в CRM».
export * from './model';
export { useRelatedCrm } from './lib/hooks/use-related-crm';
export type { RelatedCrmData } from './lib/hooks/use-related-crm';
export {
    dealAmount,
    stageColor,
    stageProgress,
    stagePositionLabel,
    stageSegments,
} from './lib/stage-view';
export type { StageSegment } from './lib/stage-view';
export { getLeadStatusView, isLeadOpen } from './lib/lead-status-view';
export type { LeadStatusView, LeadSemantic } from './lib/lead-status-view';
export { resolveTaskRelation } from './lib/resolve-task-relation';
export type { TaskRelation } from './lib/resolve-task-relation';
export { StageMini } from './ui/StageMini';
export { RelationMini } from './ui/RelationMini';
export { useCurrentRelations } from './lib/hooks/use-current-relations';
export type { CurrentRelations } from './lib/hooks/use-current-relations';
export { getEntityDescriptor } from './lib/entity-descriptor';
export type { EntityDescriptor } from './lib/entity-descriptor';
