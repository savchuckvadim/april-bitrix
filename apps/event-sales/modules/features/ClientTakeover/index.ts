// Публичная поверхность фичи «перехват клиента» (вопрос перед отправкой).
export {
    clientTakeoverActions,
    clientTakeoverReducer,
} from './model/ClientTakeoverSlice';
export type { ClientTakeoverState } from './model/ClientTakeoverSlice';
export type { TakeoverPreview, TakeoverPreviewDeal } from './model/types';
export {
    openClientTakeover,
    confirmClientTakeover,
    closeClientTakeover,
} from './model/ClientTakeoverThunk';
export {
    selectNeedClientTakeover,
    selectClientTakeoverLoading,
} from './lib/client-takeover.selectors';
export { describeTakeover } from './lib/client-takeover-view';
export { ClientTakeoverDialog } from './ui/ClientTakeoverDialog';
