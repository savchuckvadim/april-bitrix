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
export type OfferGenerateRequest = OfferWordByTemplateGenerateDto;
/** Участник КП с несколькими вариантами комплекта (generate-multi) */
export type DocVariant = DocumentVariantDto;
export type OfferClientType = OfferWordByTemplateGenerateDto['clientType'];
export type OfferContractType = OfferWordByTemplateGenerateDto['contractType'];
export type OfferRecipient = OfferWordByTemplateGenerateDto['recipient'];
export type OfferManager = OfferWordByTemplateGenerateDto['manager'];
export type OfferInvoice = OfferWordByTemplateGenerateDto['invoice'];
