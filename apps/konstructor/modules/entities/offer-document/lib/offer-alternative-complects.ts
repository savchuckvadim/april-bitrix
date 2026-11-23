import type { RootState } from '@/modules/app/model/store';
import type { Catalog } from '../../catalog';
import { buildAlternativeComplects, type DocAlternativeSetComplects, type DocVariant } from '../../document-payload';
import type { RowSet } from '../../row-set';
import type { OfferBlockerFormat } from './build-offer-request';

/**
 * Наполнение наборов для сравнения в запросе КП: поле `alternativeComplects`
 * самого КП и каждого участника-варианта. Нет поля — бэк печатает КП как раньше.
 */
export interface AlternativeComplectsFields {
    alternativeComplects?: DocAlternativeSetComplects[];
}

/**
 * Форматы КП, в которые уходит наполнение наборов для сравнения. Это
 * ЕДИНСТВЕННАЯ точка выбора формата: оба формата собирают поле через
 * alternativeComplectsFields и читают этот список.
 *
 * Word-шаблоны блок «Наполнение наборов для сравнения» ещё не печатают: бэк
 * отдаёт данные в поля шаблона (`AlternativeComplectSections`,
 * `IsAlternativeComplects`), а docx-шаблоны правит владелец. Пока их нет, Word
 * поле не шлёт. Чтобы включить Word, достаточно поставить `word: true`: запросы
 * Word (buildOfferGenerateRequest, offerVariantsFields,
 * buildOfferMultiGenerateRequest) уже проходят через эту функцию и берут
 * настройку из настроек PDF-КП (selectAlternativeComplectsEnabled).
 */
export const ALTERNATIVE_COMPLECTS_FORMATS: Readonly<Record<OfferBlockerFormat, boolean>> = {
    word: false,
    pdf: true,
};

/**
 * Настройка «Наполнение наборов для сравнения» из состояния. Её хранят настройки
 * PDF-КП (`prefs.settings`): слепок сделки, браузер и избранное запоминают её
 * вместе с остальными.
 */
export const selectAlternativeComplectsEnabled = (state: RootState): boolean =>
    state.offerPdf.prefs.settings.alternativeComplects;

/**
 * Поле `alternativeComplects` для формата `format`: настройка включена, формат
 * его печатает и у наборов для сравнения есть наполнение — иначе пустой объект.
 * `alternative` — наборы того документа, которому поле принадлежит: тела КП или
 * участника-варианта.
 */
export const alternativeComplectsFields = (
    format: OfferBlockerFormat,
    enabled: boolean,
    catalog: Catalog,
    alternative: RowSet[],
): AlternativeComplectsFields => {
    if (!enabled || !ALTERNATIVE_COMPLECTS_FORMATS[format]) return {};
    const alternativeComplects = buildAlternativeComplects(catalog, alternative);
    return alternativeComplects.length > 0 ? { alternativeComplects } : {};
};

/** Участник КП вместе с наполнением его наборов для сравнения; поля нет — тот же участник. */
export const withAlternativeComplects = (doc: DocVariant, fields: AlternativeComplectsFields): DocVariant =>
    fields.alternativeComplects ? { ...doc, ...fields } : doc;
