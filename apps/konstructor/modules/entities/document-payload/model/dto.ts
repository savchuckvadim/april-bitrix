import type {
    ComplectDto,
    ComplectInfoblockValueDto,
    ContractDto,
    ContractSpecificationFormRequestDto,
    DocumentVariantDto,
    InfoblockGroupType,
    OfferWordByTemplateGenerateDto,
    ProductDto,
    ProductRowDto,
    ProductRowFullSetsDto,
    ProductRowSetDto,
    RowPriceDto,
    SupplyDto,
} from '@workspace/nest-konstructor-api';

/**
 * Легаси-формы payload документов (generated DTO бэка konstructor) под
 * стабильными именами. Домен конструктора в них переводит адаптер
 * `lib/*` — бэк принимает эти формы для КП, договора и отчёта о поставке.
 */
export type DocComplectGroup = ComplectDto;
export type DocInfoblock = ComplectInfoblockValueDto;
export type DocGroupType = InfoblockGroupType;
export type DocContract = ContractDto;
export type DocSupply = SupplyDto;
export type DocProduct = ProductDto;
export type DocRow = ProductRowDto;
export type DocRowPrice = RowPriceDto;
export type DocRowSet = ProductRowSetDto;
export type DocRowSets = ProductRowFullSetsDto;

/**
 * Комплект общего набора со своим наполнением (OfferComplectSectionDto бэка):
 * по нему КП печатает раздел «по комплектам». `title` — название строки в
 * таблице цен, `supplyName` — её поставка.
 */
export interface DocComplectSection {
    title: string;
    supplyName?: string;
    complect: DocComplectGroup[];
}

/**
 * Наполнение одного набора для сравнения (OfferAlternativeSetComplectsDto
 * бэка). `setNumber` и `title` совпадают с номером и заголовком набора в
 * таблице цен (`setId` его строк и «Набор N»); бэк их со строками цен не
 * сверяет, соответствие обеспечивает сборка (doc-set-numbers).
 */
export interface DocAlternativeSetComplects {
    /** Целое от 1: номер набора для сравнения, нулевой или дробный даёт 400 на весь запрос */
    setNumber: number;
    title: string;
    complects: DocComplectSection[];
}

/**
 * Разделы по комплектам и наполнение наборов для сравнения в теле КП и
 * участника-варианта. Бэк принимает поля `complects` и `alternativeComplects` у
 * формирования, превью и PDF КП, но в сгенерированном клиенте их пока нет.
 * После `pnpm run generate` они появятся в OfferWordByTemplateGenerateDto и
 * DocumentVariantDto, и это расширение можно убрать.
 */
export interface DocComplectsFields {
    /** Есть, когда в общем наборе два и больше комплекта с наполнением */
    complects?: DocComplectSection[];
    /**
     * Наполнение наборов для сравнения: есть, когда менеджер включил показ и
     * хотя бы у одного набора есть комплект с наполнением. Без поля или с
     * пустым массивом бэк печатает КП как раньше.
     */
    alternativeComplects?: DocAlternativeSetComplects[];
}

/**
 * Платный Legal Tech участника КП: поле `lt` варианта документа — тот же
 * объект, что `lt` формы договора (бесплатная часть и платные пакеты, у
 * каждого пакета свой состав). Бэк принимает его у участника, в
 * сгенерированном клиенте поля пока нет. После `pnpm run generate` оно
 * появится в DocumentVariantDto, и это расширение можно убрать.
 */
export interface DocVariantLtFields {
    lt?: ContractSpecificationFormRequestDto['lt'];
}

export type OfferGenerateRequest = OfferWordByTemplateGenerateDto & DocComplectsFields;
/** Участник КП с несколькими вариантами комплекта (generate-multi) */
export type DocVariant = DocumentVariantDto & DocComplectsFields & DocVariantLtFields;
export type OfferClientType = OfferWordByTemplateGenerateDto['clientType'];
export type OfferContractType = OfferWordByTemplateGenerateDto['contractType'];
export type OfferRecipient = OfferWordByTemplateGenerateDto['recipient'];
export type OfferManager = OfferWordByTemplateGenerateDto['manager'];
export type OfferInvoice = OfferWordByTemplateGenerateDto['invoice'];
