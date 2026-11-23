import { isAnyOf, type UnknownAction } from '@reduxjs/toolkit';
// прямыми путями, мимо баррелей с UI: матчеры попадают в бандл оболочки вместе со слушателями
import { isSameOfferComposition } from '@/modules/entities/complect-variant/lib/offer-composition';
import {
    complectVariantActions,
    selectComplectMode,
    selectComposition,
} from '@/modules/entities/complect-variant/model/ComplectVariantSlice';
import { offerDocumentActions } from '@/modules/entities/offer-document/model/OfferDocumentSlice';
import { documentProvidertAC } from '@/modules/entities/provider/model/DocumentProviderSlice';
import { wordTemplateAC } from '@/modules/entities/offer-template-word/model/WordTemplateSlice';
import { isRowSetContentAction } from '@/modules/entities/row-set/lib/content-actions';
import type { RootState } from '../model/store';

/** Срез состояния, который читают проверки устаревания: настройки и варианты сделки. */
type VariantsState = Pick<RootState, 'complectVariant'>;

/**
 * Действия, после которых готовое PDF-превью Word устарело: шапка КП
 * (получатель, счёт), поставщик, любое изменение набора строк, выбор
 * Word-шаблона и состав вариантов. Шаблон считается сменённым при выборе, при
 * загрузке выбора пользователя и при правке или удалении самого шаблона: в
 * запрос уходит selectedTemplate, а currentTemplate запоминает слепок.
 * Состав вариантов меняют записи вариантов (загрузка, запись открытого
 * варианта), их стадии (закрытый вариант выпадает из документов), открытый
 * вариант и сброс: всё это уходит в запрос полями variants и composition.
 * Настройки сделки (setComposition) в список не входят: КП идёт по открытому
 * варианту при любом режиме, и устаревание от них решает isOfferPreviewStale
 * по тому, что изменилось в настройках.
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
    complectVariantActions.reset,
    isRowSetContentAction,
    wordTemplateAC.setSelectedTemplate,
    wordTemplateAC.setCurrentTemplate,
    wordTemplateAC.setFetchedSelectedTemplates,
    wordTemplateAC.updateTemplate,
    wordTemplateAC.deleteTemplate,
);

/**
 * Превью КП после действия устарело. Кроме действий из
 * isOfferPreviewStaleAction, это запись настроек сделки, в которой изменилось
 * то, что уходит в КП (открытый вариант, печать). Смена одного режима (кто идёт
 * в договор и отчёт) превью не устаревает: в запрос КП режим не входит.
 */
export const isOfferPreviewStale = (
    action: UnknownAction,
    current: VariantsState,
    previous: VariantsState,
): boolean =>
    isOfferPreviewStaleAction(action) ||
    (complectVariantActions.setComposition.match(action) &&
        !isSameOfferComposition(selectComposition(current), selectComposition(previous)));

/**
 * Режим вариантов (кто идёт в договор и отчёт о поставке) после действия стал
 * другим. Готовые результаты договора и отчёта при этом устарели.
 */
export const isComplectModeChanged = (current: VariantsState, previous: VariantsState): boolean =>
    selectComplectMode(current) !== selectComplectMode(previous);

/**
 * Действия, после которых загруженная спецификация договора устарела: состав
 * и суммы она берёт из набора строк, поэтому любое его изменение (включая
 * раскладку слепка) требует запросить её заново.
 */
export const isContractSpecStaleAction = isRowSetContentAction;
