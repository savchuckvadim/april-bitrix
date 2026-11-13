export * from './WordTemplateMenu';
// сам WordTemplatePdfPreviewPanel из барреля не экспортируется: react-pdf нельзя грузить на сервере
export { WordTemplatePdfPreviewPanelLoadable } from './WordTemplatePdfPreviewPanel.loadable';
export { WordTemplatePreviewThumbLoadable } from './WordTemplatePreviewThumb.loadable';
export { WordTemplateForm } from './components/WordTemplateForm/WordTemplateForm';
export { WordTemplateTagsExampleDownloadButton } from './components/WordTemplateTagsExampleDownloadButton/WordTemplateTagsExampleDownloadButton';
