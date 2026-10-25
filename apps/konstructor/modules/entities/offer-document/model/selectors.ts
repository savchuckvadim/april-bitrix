import type { OfferDocumentState } from './OfferDocumentSlice';

interface WithOfferDocument {
    offerDocument: OfferDocumentState;
}

export const selectOfferRecipient = (state: WithOfferDocument) => state.offerDocument.recipient;
export const selectOfferCaseLoading = (state: WithOfferDocument) => state.offerDocument.caseLoading;
export const selectOfferInvoice = (state: WithOfferDocument) => state.offerDocument.invoice;
export const selectOfferGenerate = (state: WithOfferDocument) => state.offerDocument.generate;
export const selectOfferInitialized = (state: WithOfferDocument) => state.offerDocument.initialized;
