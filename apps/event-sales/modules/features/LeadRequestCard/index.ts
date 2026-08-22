/**
 * Публичная поверхность фичи «Карточка заявки/лида».
 *
 * ВНИМАНИЕ: reducer в store.ts подключается ПРЯМЫМ путём
 * (`./model/LeadRequestSlice`), не через этот barrel — barrel тянет UI
 * (см. предупреждение о циклах в store.ts).
 */
export { LeadRequestPanel } from './ui/LeadRequestPanel';
// Статус заявки нужен снаружи: иконка в панели пульта показывает его подсказкой.
export { getReadinessBadge } from './lib/lead-request-view';
export { useLeadRequest } from './lib/hooks/use-lead-request';
export {
    fetchLeadRequestCard,
    saveLeadRequest,
} from './model/LeadRequestThunk';
export { leadRequestActions } from './model/LeadRequestSlice';
export type {
    LeadRequestCard,
    LeadRequestUpdate,
    LeadNotCaTypeCode,
} from './model';
export { LEAD_NOT_CA_TYPE_CODE } from './model';
// Экран подтверждения заявки — монтируется на экранах приложения.
export { LeadConfirmGate } from './ui/LeadConfirmGate';
