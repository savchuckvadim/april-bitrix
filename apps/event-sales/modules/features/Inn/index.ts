// Публичная поверхность фичи ИНН.
export { innReducer, innActions } from './model/InnSlice';
export { saveInn } from './model/InnThunk';
export { getCurrentInn, getInnTarget } from './lib/inn-selectors';
export type { InnTarget } from './lib/inn-selectors';
export { isValidInn, normalizeInn } from './lib/inn-validate';
export { InnEditor } from './ui/InnEditor';
export { InnControl } from './ui/InnControl';
