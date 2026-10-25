export * from './model/types';
export {
    selectIsServiceSmartMode,
    selectServiceOffer,
    selectServicePeriod,
    selectServiceSmartId,
    selectServiceTarget,
    serviceOfferActions,
    serviceOfferReducer,
    type ServiceOfferState,
} from './model/ServiceOfferSlice';
export { initServiceOffer, setServicePeriod } from './model/ServiceOfferThunk';
export { buildServiceOfferTitle } from './lib/service-offer-title.util';
