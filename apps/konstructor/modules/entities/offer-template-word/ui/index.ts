export * from './WordTemplateMenu';
export * from './WordTemplateSettingsDialog';
export * from './WordTemplateSettingsPage';
// сам WordTemplatePdfPreviewPanel из барреля не экспортируется: react-pdf нельзя грузить на сервере
export { WordTemplatePdfPreviewPanelLoadable } from './WordTemplatePdfPreviewPanel.loadable';
