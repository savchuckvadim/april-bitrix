export * from './model/types';
export { offerDocumentActions, offerDocumentReducer, type OfferDocumentState } from './model/OfferDocumentSlice';
export * from './model/selectors';
export { declineRecipientCase, generateOfferDocument, initOfferDocument } from './model/OfferDocumentThunk';
export {
    buildOfferGenerateRequest,
    buildOfferMultiGenerateRequest,
    offerBlocker,
    offerRequestBlocker,
    offerVariantsFields,
    type OfferMultiGenerateRequest,
    type OfferBlockerFormat,
    type OfferVariantsFields,
} from './lib/build-offer-request';
export { alternativeComplectsFields, withAlternativeComplects } from './lib/offer-alternative-complects';
export {
    buildVariantsPayload,
    type SkippedVariant,
    type SkippedVariantReason,
    type VariantsPayload,
} from './lib/build-variants-payload';
export { selectModeVariantsPayload, selectOfferVariantsPayload } from './lib/select-variants-payload';
export { buildDealProductRows, type DealProductRowsInput, type DealProductRowsResult } from './lib/build-deal-product-rows';
export { dealProductRowsBlocker, selectDealProductRows } from './lib/select-deal-product-rows';
export { skippedVariantsBlocker } from './lib/skipped-variants-blocker';
export { managerFromBxUser } from './lib/manager.util';
export { toOfferClientType } from './lib/client-type.util';
export { resolveInvoiceDefaults, resolveRecipientDefaults, toInputDate } from './lib/document-defaults.util';
