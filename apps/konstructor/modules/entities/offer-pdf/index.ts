export * from './model/types';
export {
    OfferPdfDocumentProvider,
    useOfferPdfDocument,
    type OfferPdfDocumentContextValue,
    type OfferPdfGenerateState,
    type OfferPdfPreviewState,
} from './model/OfferPdfDocumentContext';
export { buildOfferPdfGenerateRequest, offerPdfRequestBlocker } from './lib/build-offer-pdf-request';
export { loadOfferPdfPrefs, normalizeOfferPdfPrefs, saveOfferPdfPrefs } from './lib/offer-pdf-storage';
export { OfferDocumentFormatSwitch } from './ui/OfferDocumentFormatSwitch';
export { OfferPdfTemplateCard } from './ui/OfferPdfTemplateCard';
export { OfferPdfGenerateButton } from './ui/OfferPdfGenerateButton';
// сама панель превью из барреля не экспортируется: react-pdf нельзя грузить на сервере
export { OfferPdfPreviewPanelLoadable } from './ui/OfferPdfPreviewPanel.loadable';
