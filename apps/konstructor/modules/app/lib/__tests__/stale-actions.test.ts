import { describe, expect, it } from 'vitest';
import {
    complectVariantActions,
    complectVariantReducer,
    type ComplectVariantState,
} from '@/modules/entities/complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    COMPLECT_OFFER_INFOBLOCKS,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectComposition,
} from '@/modules/entities/complect-variant/model/dto';
import { offerDocumentActions } from '@/modules/entities/offer-document/model/OfferDocumentSlice';
import { offerPdfActions } from '@/modules/entities/offer-pdf/model/OfferPdfSlice';
import { wordTemplateAC } from '@/modules/entities/offer-template-word/model/WordTemplateSlice';
import { documentProvidertAC } from '@/modules/entities/provider/model/DocumentProviderSlice';
import { rowSetActions } from '@/modules/entities/row-set/model/RowSetSlice';
import {
    isComplectModeChanged,
    isContractSpecStaleAction,
    isOfferPreviewStale,
    isOfferPreviewStaleAction,
} from '../stale-actions';

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
        ['загрузка записей вариантов и настроек сделки', complectVariantActions.loaded],
        ['загрузка стадий вариантов (кто участвует)', complectVariantActions.itemsLoaded],
        ['сбой загрузки вариантов (участников не осталось)', complectVariantActions.failed],
        ['запись варианта', complectVariantActions.upsertRecord],
        ['смена открытого варианта', complectVariantActions.setOpenVariant],
        ['сброс вариантов', complectVariantActions.reset],
    ])('%s — превью устарело', (_title, creator) => {
        expect(isOfferPreviewStaleAction({ type: creator.type })).toBe(true);
    });

    it.each([
        ['выбор строки', rowSetActions.selectRow],
        ['режим редактирования набора', rowSetActions.startSetEditing],
        ['конец редактирования набора', rowSetActions.stopSetEditing],
        ['запрос пересчёта набора', rowSetActions.resyncSet],
        ['контекст сборки', rowSetActions.setContext],
        ['ответ о счёте (превью счёт не рисует)', offerDocumentActions.setInvoiceAnswer],
        ['дата счёта', offerDocumentActions.setInvoiceDate],
        ['номер счёта', offerDocumentActions.setInvoiceNumber],
        ['загрузка презентаций сделки (превью их не получает)', offerDocumentActions.presentationLoaded],
        ['ответ «Документы в продолжение презентации?»', offerDocumentActions.setPresentationAnswer],
        ['выбор презентации', offerDocumentActions.setPresentationDeal],
        ['значение нумератора счёта (peek)', offerDocumentActions.invoicePeekLoaded],
        ['загрузка списка шаблонов', wordTemplateAC.setTemplates],
        ['избранное шаблонов', wordTemplateAC.addToFavorites],
        ['начало загрузки вариантов', complectVariantActions.loading],
        ['настройки сделки (решает isOfferPreviewStale по их содержимому)', complectVariantActions.setComposition],
        ['сбой действия с вариантами', complectVariantActions.actionFailed],
        ['снятие текста ошибки вариантов', complectVariantActions.clearError],
        ['флаг записи вариантов', complectVariantActions.busy],
    ])('%s — превью остаётся как есть', (_title, creator) => {
        expect(isOfferPreviewStaleAction({ type: creator.type })).toBe(false);
    });
});

/** Срез состояния вариантов с заданными настройками сделки. */
const stateWith = (composition: ComplectComposition | null): { complectVariant: ComplectVariantState } => ({
    complectVariant: complectVariantReducer(
        undefined,
        complectVariantActions.loaded({ records: [], composition }),
    ),
});

const ALL_MODES = [COMPLECT_MODE.compare, COMPLECT_MODE.single_contract, COMPLECT_MODE.multi_contract];

describe('устаревание превью КП от настроек сделки', () => {
    const base = { ...DEFAULT_COMPLECT_COMPOSITION, mode: COMPLECT_MODE.compare };
    const save = (composition: ComplectComposition) => complectVariantActions.setComposition(composition);

    it.each(ALL_MODES.flatMap(from => ALL_MODES.filter(to => to !== from).map(to => [from, to] as const)))(
        'смена только режима %s → %s превью не устаревает',
        (from, to) => {
            const before = stateWith({ ...base, mode: from });
            const after = stateWith({ ...base, mode: to });
            expect(isOfferPreviewStale(save({ ...base, mode: to }), after, before)).toBe(false);
        },
    );

    it('смена печати КП (инфоблоки) превью устаревает', () => {
        const merged = {
            ...base,
            offer: { ...base.offer, infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged },
        };
        expect(isOfferPreviewStale(save(merged), stateWith(merged), stateWith(base))).toBe(true);
    });

    it('смена открытого варианта в настройках превью устаревает', () => {
        const reopened = { ...base, openVariantSmartId: 7 };
        expect(isOfferPreviewStale(save(reopened), stateWith(reopened), stateWith(base))).toBe(true);
    });

    it('откат настроек после сбоя записи, вернувший прежний режим, превью не трогает', () => {
        const multi = { ...base, mode: COMPLECT_MODE.multi_contract };
        expect(isOfferPreviewStale(save(base), stateWith(base), stateWith(multi))).toBe(false);
    });

    it('переключатель сопроводительного письма превью устаревает, прочие настройки PDF — нет', () => {
        const state = stateWith(base);
        expect(isOfferPreviewStale(offerPdfActions.setSettings({ withLetter: false }), state, state)).toBe(true);
        expect(isOfferPreviewStale(offerPdfActions.setSettings({ withLetter: true }), state, state)).toBe(true);
        expect(isOfferPreviewStale(offerPdfActions.setSettings({ withStamps: false }), state, state)).toBe(false);
        expect(isOfferPreviewStale(offerPdfActions.setLetter({ text: 'Текст' }), state, state)).toBe(false);
    });

    it('остальные действия из списка устаревания решает тип действия, настройки при этом не важны', () => {
        const state = stateWith(base);
        expect(isOfferPreviewStale({ type: offerDocumentActions.setRecipientField.type }, state, state)).toBe(true);
        expect(isOfferPreviewStale({ type: complectVariantActions.setOpenVariant.type }, state, state)).toBe(true);
        expect(isOfferPreviewStale({ type: complectVariantActions.busy.type }, state, state)).toBe(false);
    });
});

describe('смена режима вариантов', () => {
    it.each(ALL_MODES.flatMap(from => ALL_MODES.filter(to => to !== from).map(to => [from, to] as const)))(
        '%s → %s: режим стал другим, результаты договора и отчёта устарели',
        (from, to) => {
            const before = stateWith({ ...DEFAULT_COMPLECT_COMPOSITION, mode: from });
            const after = stateWith({ ...DEFAULT_COMPLECT_COMPOSITION, mode: to });
            expect(isComplectModeChanged(after, before)).toBe(true);
        },
    );

    it('тот же режим, правка другой настройки — режим не менялся', () => {
        const before = stateWith(DEFAULT_COMPLECT_COMPOSITION);
        const after = stateWith({
            ...DEFAULT_COMPLECT_COMPOSITION,
            offer: { ...DEFAULT_COMPLECT_COMPOSITION.offer, infoblocks: COMPLECT_OFFER_INFOBLOCKS.merged },
        });
        expect(isComplectModeChanged(after, before)).toBe(false);
    });

    it('настройки сделки не заданы — режим по умолчанию, смены нет', () => {
        expect(isComplectModeChanged(stateWith(null), stateWith(DEFAULT_COMPLECT_COMPOSITION))).toBe(false);
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
