// Публичная поверхность фичи точек связи лида (телефон/email).
export {
    clientSignalsReducer,
    clientSignalsActions,
} from './model/ClientSignalsSlice';
export { saveSignal } from './model/ClientSignalsThunk';
export { getSignalsTarget } from './lib/signal-selectors';
export type { SignalsTarget } from './lib/signal-selectors';
export type { SignalKind } from './lib/signal-validate';
export { SignalsControl } from './ui/SignalsControl';
