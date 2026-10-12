/**
 * РУЧНЫЕ типы шаблона договора.
 *
 * Почему руками, а не Orval: backend-модуль
 * `back/apps/konstructor/src/modules/contract-template` пишется параллельно,
 * его эндпоинты ещё не попали в Swagger (`http://localhost:3007/docs/api-json`),
 * поэтому `pnpm generate` в `packages/nest-konstructor-api` их не видит.
 *
 * Типы здесь — зеркало уже написанных DTO:
 *   dto/contract-template-response.dto.ts  → IContractTemplate, IContractTemplatePage
 *   dto/create-contract-template.dto.ts    → ICreateContractTemplateDto
 *   dto/update-contract-template.dto.ts    → IUpdateContractTemplateDto
 *   dto/contract-template-query.dto.ts     → IContractTemplateQuery
 *
 * ЗАМЕНА НА ГЕНЕРАЦИЮ — механическая: когда бэкенд поднимется и
 * `pnpm generate` создаст `generated/contract-templates/contract-templates.ts`,
 * достаточно переписать этот файл в тот же вид, что у word-template
 * (`export interface IContractTemplate extends ContractTemplateResponseDto {}`),
 * и переключить транспорт в `lib/api/contract-template.helper.ts` на
 * `getContractTemplates()`. Ни хуки, ни UI трогать не придётся — они
 * зависят только от имён из этого файла.
 */
import type {
    ClientTypeCode,
    ContractLtypeCode,
    SupplyTypeCode,
    TemplateScopeCode,
} from '@/modules/entities/konstructor/lib';

/**
 * Строка шаблона договора.
 *
 * ВСЕ id — СТРОКИ: в БД это BIGINT autoincrement, наружу уходит `String(row.id)`
 * (BigInt не сериализуется в JSON, значения > 2^53 не влезают в number).
 * Никогда не приводите их к number.
 */
export interface IContractTemplate {
    id: string;
    name: string;
    /** Технический код, генерируется бэкендом при создании. */
    code: string;
    contract_type: ContractLtypeCode;
    /** `null` — «подходит любому типу клиента». */
    client_types: ClientTypeCode[] | null;
    /** `null` — «подходит любому типу поставки». */
    supply_types: SupplyTypeCode[] | null;
    description?: string | null;
    is_default: boolean;
    is_active: boolean;
    is_archived: boolean;
    archived_at?: string | null;
    /** `null` — общий шаблон (у `contract_templates` нет колонки visibility). */
    portal_id: string | null;
    /** `null` — годится любому поставщику. */
    agent_id: string | null;
    creator_bitrix_user_id: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    template_url: string;
    demo_url?: string | null;
}

/** Страница списка. Без `total` реальную таблицу админки не построить. */
export interface IContractTemplatePage {
    items: IContractTemplate[];
    total: number;
    take: number;
    skip: number;
}

/** Значение по умолчанию и потолок страницы — как в query-DTO бэкенда. */
export const CONTRACT_TEMPLATE_PAGE_SIZE = 50;
export const CONTRACT_TEMPLATE_PAGE_SIZE_MAX = 200;

export interface IContractTemplateQuery {
    portal_id?: string;
    /** «Только общие» (portal_id IS NULL) — отдельный флаг, не то же, что «без фильтра». */
    only_common?: boolean;
    agent_id?: string;
    contract_type?: ContractLtypeCode;
    /** Фильтр по ОДНОМУ типу клиента (бэкенд считает совпадение в TS). */
    client_type?: ClientTypeCode;
    supply_type?: SupplyTypeCode;
    is_active?: boolean;
    is_archived?: boolean;
    search?: string;
    take?: number;
    skip?: number;
}

/**
 * Тело создания (multipart). `file` обязателен, `demo` — нет.
 * `scope` в БД не хранится: из него выводятся `portal_id`/`agent_id`.
 */
export interface ICreateContractTemplateDto {
    name: string;
    /** ОБЯЗАТЕЛЕН: шаблона договора «по умолчанию» не существует. */
    contract_type: ContractLtypeCode;
    scope?: TemplateScopeCode;
    portal_id?: string;
    agent_id?: string;
    /** Пустой список — не отправляется: отсутствие поля = «для любого». */
    client_types?: ClientTypeCode[];
    supply_types?: SupplyTypeCode[];
    description?: string;
    is_default?: boolean;
    is_active?: boolean;
    creator_bitrix_user_id?: string;
    file: File;
    demo?: File;
}

/**
 * Частичное обновление. Отсутствие поля = «не менять».
 * Сброс списка в «любой» выражается ПУСТЫМ массивом (бэкенд пишет NULL),
 * а не `null` — поэтому пустой массив здесь отправляется, в отличие от create.
 */
export interface IUpdateContractTemplateDto {
    name?: string;
    /** Сбросить тип договора нельзя: колонка NOT NULL. */
    contract_type?: ContractLtypeCode;
    /** Пустая строка переводит шаблон в общие. */
    portal_id?: string;
    /** Пустая строка снимает привязку к поставщику. */
    agent_id?: string;
    client_types?: ClientTypeCode[];
    supply_types?: SupplyTypeCode[];
    description?: string;
    is_default?: boolean;
    is_active?: boolean;
}

export interface ISetContractTemplatePortalDto {
    portal_id?: string | null;
}

export interface ISetContractTemplateAgentDto {
    agent_id?: string | null;
}

/** Значения формы до нормализации в DTO. */
export interface IContractTemplateFormValues {
    name: string;
    contract_type: ContractLtypeCode | '';
    scope: TemplateScopeCode;
    portal_id: string;
    agent_id: string;
    client_types: ClientTypeCode[];
    supply_types: SupplyTypeCode[];
    description: string;
    is_default: boolean;
    is_active: boolean;
    file?: File | null;
    demo?: File | null;
}
