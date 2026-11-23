import type {
    ComplectDto,
    ComplectInfoblockValueDto,
    ContractDto,
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
 * Разделы по комплектам в теле КП и участника-варианта. Бэк принимает поле
 * `complects` у формирования, превью и PDF КП, но в сгенерированном клиенте
 * его пока нет. После `pnpm run generate` оно появится в OfferWordByTemplateGenerateDto
 * и DocumentVariantDto, и это расширение можно убрать.
 */
export interface DocComplectsFields {
    /** Есть, когда в общем наборе два и больше комплекта с наполнением */
    complects?: DocComplectSection[];
}

export type OfferGenerateRequest = OfferWordByTemplateGenerateDto & DocComplectsFields;
/** Участник КП с несколькими вариантами комплекта (generate-multi) */
export type DocVariant = DocumentVariantDto & DocComplectsFields;
export type OfferClientType = OfferWordByTemplateGenerateDto['clientType'];
export type OfferContractType = OfferWordByTemplateGenerateDto['contractType'];
export type OfferRecipient = OfferWordByTemplateGenerateDto['recipient'];
export type OfferManager = OfferWordByTemplateGenerateDto['manager'];
export type OfferInvoice = OfferWordByTemplateGenerateDto['invoice'];
