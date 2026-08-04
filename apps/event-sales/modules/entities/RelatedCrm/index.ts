// Публичная поверхность сущности «связи клиента в CRM».
export * from './model';
export { useRelatedCrm } from './lib/hooks/use-related-crm';
export type { RelatedCrmData } from './lib/hooks/use-related-crm';
export {
    stageColor,
    stageProgress,
    stagePositionLabel,
    stageSegments,
} from './lib/stage-view';
export type { StageSegment } from './lib/stage-view';
export { getLeadStatusView, isLeadOpen } from './lib/lead-status-view';
export type { LeadStatusView, LeadSemantic } from './lib/lead-status-view';
export { StageMini } from './ui/StageMini';
