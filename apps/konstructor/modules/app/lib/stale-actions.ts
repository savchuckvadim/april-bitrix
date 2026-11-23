import { isAnyOf } from '@reduxjs/toolkit';
// прямыми путями, мимо баррелей с UI: матчеры попадают в бандл оболочки вместе со слушателями
import { offerDocumentActions } from '@/modules/entities/offer-document/model/OfferDocumentSlice';
import { documentProvidertAC } from '@/modules/entities/provider/model/DocumentProviderSlice';
import { wordTemplateAC } from '@/modules/entities/offer-template-word/model/WordTemplateSlice';
import { isRowSetContentAction } from '@/modules/entities/row-set/lib/content-actions';

/**
 * Действия, после которых готовое PDF-превью Word устарело: шапка КП
 * (получатель, счёт), поставщик, любое изменение набора строк и выбор
 * Word-шаблона. Шаблон считается сменённым при выборе, при загрузке выбора
 * пользователя и при правке или удалении самого шаблона: в запрос уходит
 * selectedTemplate, а currentTemplate запоминает слепок.
 */
export const isOfferPreviewStaleAction = isAnyOf(
    offerDocumentActions.setRecipientField,
    offerDocumentActions.setRecipientCase,
    offerDocumentActions.setInvoiceAnswer,
    offerDocumentActions.setInvoiceDate,
    offerDocumentActions.setInvoiceNumber,
    documentProvidertAC.setCurrent,
    isRowSetContentAction,
    wordTemplateAC.setSelectedTemplate,
    wordTemplateAC.setCurrentTemplate,
    wordTemplateAC.setFetchedSelectedTemplates,
    wordTemplateAC.updateTemplate,
    wordTemplateAC.deleteTemplate,
);

/**
 * Действия, после которых загруженная спецификация договора устарела: состав
 * и суммы она берёт из набора строк, поэтому любое его изменение (включая
 * раскладку слепка) требует запросить её заново.
 */
export const isContractSpecStaleAction = isRowSetContentAction;
