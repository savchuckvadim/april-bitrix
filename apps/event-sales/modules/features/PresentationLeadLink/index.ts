// Публичная поверхность фичи «презентация связана с заявкой».
export {
    presentationLeadLinkActions,
    presentationLeadLinkReducer,
} from './model/PresentationLeadLinkSlice';
export type { PresentationLeadLinkState } from './model/PresentationLeadLinkSlice';
export {
    openPresentationLeadLink,
    closePresentationLeadLink,
    confirmPresentationLeadLink,
} from './model/PresentationLeadLinkThunk';
export {
    selectNeedPresentationLeadLink,
    selectHasPresentationFact,
} from './lib/presentation-lead-link.selectors';
export { PresentationLeadLinkDialog } from './ui/PresentationLeadLinkDialog';
