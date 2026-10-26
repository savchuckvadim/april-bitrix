// Публичная поверхность фичи «Тип клиента».
export { clientTypeReducer, clientTypeActions } from './model/ClientTypeSlice';
export {
    alignClientTypeOnOpen,
    saveClientType,
} from './model/ClientTypeThunk';
export { selectClientTypeView } from './lib/client-type-selectors';
export type { ClientTypeCode, ClientTypeView } from './lib/client-type-view';
export { ClientTypeChip } from './ui/ClientTypeChip';
