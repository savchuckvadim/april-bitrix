// Публичная поверхность фичи пометок лидов/заявок.
export { leadMarksReducer, leadMarksActions } from './model/LeadMarksSlice';
export { fetchLeadMarks, saveLeadMark } from './model/LeadMarksThunk';
export type { LeadMarkPatch } from './model/LeadMarksThunk';
export {
    isLeadMarkComplete,
    LEAD_NOT_CA_ITEM_CODE,
} from './lib/lead-marks-view';
export type { LeadMark } from './lib/lead-marks-view';
export { LeadMarksList } from './ui/LeadMarksList';
export { LeadMarkRow } from './ui/LeadMarkRow';
