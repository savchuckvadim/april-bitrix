import type {
    CategoryDto,
    DealDto,
    FieldDto,
    FieldItemDto,
    FrontPortalDto,
    FrontPortalPartsDto,
    FrontPortalPartsRequestDto,
    PortalPartName as PortalPartNameDto,
    RpaDto,
    SmartDto,
} from '@workspace/nest-konstructor-api';

/**
 * Слепок портала (pbx-сущности нашей БД) — доменные алиасы generated-DTO
 * `POST /api/front/portal`. Переименование на бэке правится только здесь.
 */
export type Portal = FrontPortalDto;

/**
 * Ответ узкой ручки `POST /api/front/portal/parts`: `id` и только запрошенные
 * части, форма каждой — как в полной модели.
 */
export type PortalParts = FrontPortalPartsDto;

/** Имя части портала в запросе узкой ручки */
export type PortalPartName = PortalPartNameDto;

/**
 * Запрос узкой ручки без домена: части, типы смартов и части «без полей»
 * (только строки сущностей).
 */
export type PortalPartsQuery = Omit<FrontPortalPartsRequestDto, 'domain'>;
export type PBXSmart = SmartDto;
export type PBXRPA = RpaDto;
export type PBXCategory = CategoryDto;
export type PBXField = FieldDto;
export type PBXFieldItem = FieldItemDto;
export type PBXDeal = DealDto;

/** Смарты конструктора на портале (поле `type` смарта). */
export const PBX_SMART_TYPE = {
    /** Предложение на будущий период (сервисный отдел) */
    SERVICE_OFFER: 'service_offer',
    /** Варианты комплекта внутри сделки */
    COMPLECT_VARIANT: 'complect_variant',
} as const;

/** Коды категорий (воронок) сделки на портале. */
export const PBX_DEAL_CATEGORY = {
    SALES: 'sales_base',
    SERVICE: 'service_base',
} as const;

/**
 * Финальные стадии воронки sales_base: успех, провал, «Не состоялась»
 * (APOLOGY) и «Не ЦА». Лестница стадий лежит в
 * packages/event-sales-flow/src/types/pbx-deal-sales-base-stages.const.ts
 * (всё, что от sales_success и выше). Сделка на такой стадии закрыта.
 */
export const PBX_SALES_BASE_FINAL_STAGE_CODES: ReadonlySet<string> = new Set([
    'sales_success',
    'sales_fail',
    'sales_double',
    'sales_not_ca',
]);

/**
 * Воронка продаж портала в числах Битрикса: по ней из карточки компании
 * находится открытая сделка конструктора.
 */
export interface SalesFunnelScope {
    /** CATEGORY_ID воронки sales_base */
    categoryId: number;
    /** STAGE_ID финальных стадий этой воронки */
    finalStageIds: ReadonlySet<string>;
}

/** Код RPA-процесса поставки. */
export const PBX_RPA_SUPPLY = 'supply';
