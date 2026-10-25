import type {
    CategoryDto,
    DealDto,
    FieldDto,
    FieldItemDto,
    FrontPortalDto,
    RpaDto,
    SmartDto,
} from '@workspace/nest-konstructor-api';

/**
 * Слепок портала (pbx-сущности нашей БД) — доменные алиасы generated-DTO
 * `POST /api/front/portal`. Переименование на бэке правится только здесь.
 */
export type Portal = FrontPortalDto;
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

/** Код RPA-процесса поставки. */
export const PBX_RPA_SUPPLY = 'supply';
