export * from './model/types';
export { OfferPdfDocumentProvider, useOfferPdfDocument } from './model/OfferPdfDocumentContext';
export { useOfferPdfStyle } from './hooks/use-offer-pdf-style';
export { resolvePalette, templatePalettes } from './lib/offer-pdf-palette.util';
// редьюсер, экшены и слушатель стор берёт прямыми путями из model/ — так UI слайса не едет в оболочку
export { OfferDocumentFormatSwitch } from './ui/OfferDocumentFormatSwitch';
export { OfferPdfTemplateCard } from './ui/OfferPdfTemplateCard';
export { OfferPdfGenerateButton } from './ui/OfferPdfGenerateButton';
export { OfferPdfStyleCard } from './ui/style-picker/OfferPdfStyleCard';
export { OfferPdfPaletteSwatches } from './ui/style-picker/OfferPdfPaletteSwatches';
// сама панель превью из барреля не экспортируется: react-pdf нельзя грузить на сервере
export { OfferPdfPreviewPanelLoadable } from './ui/OfferPdfPreviewPanel.loadable';
