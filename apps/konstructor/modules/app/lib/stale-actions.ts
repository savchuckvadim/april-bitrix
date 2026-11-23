import { isAnyOf } from '@reduxjs/toolkit';
// прямыми путями, мимо баррелей с UI: матчеры попадают в бандл оболочки вместе со слушателями
import { complectVariantActions } from '@/modules/entities/complect-variant/model/ComplectVariantSlice';
import { offerDocumentActions } from '@/modules/entities/offer-document/model/OfferDocumentSlice';
import { documentProvidertAC } from '@/modules/entities/provider/model/DocumentProviderSlice';
import { wordTemplateAC } from '@/modules/entities/offer-template-word/model/WordTemplateSlice';
import { isRowSetContentAction } from '@/modules/entities/row-set/lib/content-actions';

/**
 * Действия, после которых готовое PDF-превью Word устарело: шапка КП
 * (получатель, счёт), поставщик, любое изменение набора строк, выбор
 * Word-шаблона и состав вариантов. Шаблон считается сменённым при выборе, при
 * загрузке выбора пользователя и при правке или удалении самого шаблона: в
 * запрос уходит selectedTemplate, а currentTemplate запоминает слепок.
 * Состав вариантов меняют записи вариантов (загрузка, запись открытого
 * варианта), их стадии (кто участвует), открытый вариант, сброс и настройки
 * сделки (режим и печать): всё это уходит в запрос полями variants и composition.
 */
export const isOfferPreviewStaleAction = isAnyOf(
    offerDocumentActions.setRecipientField,
    offerDocumentActions.setRecipientCase,
    offerDocumentActions.setInvoiceAnswer,
    offerDocumentActions.setInvoiceDate,
    offerDocumentActions.setInvoiceNumber,
    documentProvidertAC.setCurrent,
    complectVariantActions.loaded,
    complectVariantActions.itemsLoaded,
    complectVariantActions.failed,
    complectVariantActions.upsertRecord,
    complectVariantActions.setOpenVariant,
    complectVariantActions.setComposition,
    complectVariantActions.reset,
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
