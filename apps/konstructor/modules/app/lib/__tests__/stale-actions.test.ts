import { describe, expect, it } from 'vitest';
import { offerDocumentActions } from '@/modules/entities/offer-document/model/OfferDocumentSlice';
import { wordTemplateAC } from '@/modules/entities/offer-template-word/model/WordTemplateSlice';
import { documentProvidertAC } from '@/modules/entities/provider/model/DocumentProviderSlice';
import { rowSetActions } from '@/modules/entities/row-set/model/RowSetSlice';
import { isContractSpecStaleAction, isOfferPreviewStaleAction } from '../stale-actions';

/** Действия набора строк, меняющие содержимое документов, с подписями для менеджера. */
const ROW_SET_CONTENT: [string, { type: string }][] = [
    ['добавление или правка строки', rowSetActions.upsertRow],
    ['замена сервисной строки', rowSetActions.replaceServiceRow],
    ['удаление строки', rowSetActions.removeRow],
    ['добавление набора для сравнения', rowSetActions.addComparisonSet],
    ['удаление набора для сравнения', rowSetActions.removeComparisonSet],
    ['сворачивание и разворачивание набора', rowSetActions.toggleCollapsed],
    ['правка цены, скидки или количества строки', rowSetActions.editRowCommercial],
    ['правка свёрнутой итоговой строки', rowSetActions.editTotalCommercial],
    ['переименование строки', rowSetActions.renameRow],
    ['переключатель ₽ и %', rowSetActions.toggleDiscountMode],
    ['наполнение строки', rowSetActions.setRowComposition],
    ['пересобранный набор', rowSetActions.writeSyncedSet],
    ['раскладка слепка (смена открытого варианта)', rowSetActions.restore],
];

describe('матчер устаревания превью Word', () => {
    it.each(ROW_SET_CONTENT)('%s — превью устарело', (_title, creator) => {
        expect(isOfferPreviewStaleAction({ type: creator.type })).toBe(true);
    });

    it.each([
        ['получатель', offerDocumentActions.setRecipientField],
        ['падеж получателя', offerDocumentActions.setRecipientCase],
        ['ответ о счёте', offerDocumentActions.setInvoiceAnswer],
        ['дата счёта', offerDocumentActions.setInvoiceDate],
        ['номер счёта', offerDocumentActions.setInvoiceNumber],
        ['поставщик', documentProvidertAC.setCurrent],
        ['выбор Word-шаблона', wordTemplateAC.setSelectedTemplate],
        ['текущий Word-шаблон', wordTemplateAC.setCurrentTemplate],
        ['загрузка выбранных шаблонов пользователя', wordTemplateAC.setFetchedSelectedTemplates],
        ['правка шаблона', wordTemplateAC.updateTemplate],
        ['удаление шаблона', wordTemplateAC.deleteTemplate],
    ])('%s — превью устарело', (_title, creator) => {
        expect(isOfferPreviewStaleAction({ type: creator.type })).toBe(true);
    });

    it.each([
        ['выбор строки', rowSetActions.selectRow],
        ['режим редактирования набора', rowSetActions.startSetEditing],
        ['конец редактирования набора', rowSetActions.stopSetEditing],
        ['запрос пересчёта набора', rowSetActions.resyncSet],
        ['контекст сборки', rowSetActions.setContext],
        ['загрузка списка шаблонов', wordTemplateAC.setTemplates],
        ['избранное шаблонов', wordTemplateAC.addToFavorites],
    ])('%s — превью остаётся как есть', (_title, creator) => {
        expect(isOfferPreviewStaleAction({ type: creator.type })).toBe(false);
    });
});

describe('матчер устаревания спецификации договора', () => {
    it.each(ROW_SET_CONTENT)('%s — спецификация устарела', (_title, creator) => {
        expect(isContractSpecStaleAction({ type: creator.type })).toBe(true);
    });

    it.each([
        ['выбор строки', rowSetActions.selectRow],
        ['режим редактирования набора', rowSetActions.startSetEditing],
        ['шапка КП', offerDocumentActions.setRecipientField],
        ['выбор Word-шаблона', wordTemplateAC.setSelectedTemplate],
    ])('%s — спецификация остаётся как есть', (_title, creator) => {
        expect(isContractSpecStaleAction({ type: creator.type })).toBe(false);
    });
});
