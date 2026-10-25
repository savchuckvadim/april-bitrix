export type { Provider, ProviderRq } from './model/dto';
export {
    documentProviderReducer,
    documentProviderSlice,
    documentProvidertAC,
    type DocumentProviderState,
    type DocumentProviderStatus,
} from './model/DocumentProviderSlice';
export {
    applyDealProvider,
    initProviders,
    setCurrentProvider,
} from './model/DocumentProviderThunk';
export { resolveCurrentProvider } from './lib/resolve-current-provider.util';
