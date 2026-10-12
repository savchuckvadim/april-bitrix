/**
 * Типы шаблона отчёта о поставке — РУЧНОЕ зеркало DTO бэкенда.
 *
 * Почему руками, а не Orval: модуль
 * `back/apps/konstructor/src/modules/supply-report-template` уже написан, но
 * бэкенд локально не запущен, а `pnpm generate` в
 * `packages/nest-konstructor-api` тянет спеку с
 * `http://localhost:3007/docs/api-json`. Тега `supply-report-template` в
 * сгенерированном клиенте пока нет.
 *
 * Зеркалируемые файлы бэкенда (сверять при правках):
 *   dto/supply-report-template-response.dto.ts → ISupplyReportTemplate,
 *                                                ISupplyReportTemplatePage
 *   dto/create-supply-report-template.dto.ts   → ICreateSupplyReportTemplateDto
 *   dto/update-supply-report-template.dto.ts   → IUpdateSupplyReportTemplateDto
 *   dto/supply-report-template-query.dto.ts    → ISupplyReportTemplateQuery
 *   dto/supply-report-template.enums.ts        → SupplyReportTemplateScope
 *
 * ЗАМЕНА НА ГЕНЕРАЦИЮ — механическая: после `pnpm generate` этот файл
 * переписывается в вид word-template
 * (`export interface ISupplyReportTemplate extends SupplyReportTemplateResponseDto {}`),
 * а транспорт в `lib/api/supply-report-template.helper.ts` переключается на
 * `getSupplyReportTemplate()`. Хуки и UI зависят только от имён отсюда,
 * поэтому их менять не придётся.
 *
 * ID — всегда СТРОКИ: в БД это BIGINT autoincrement, наружу уходит
 * `String(row.id)`. Приводить к number нельзя (потеря точности).
 *
 * Колонки `contract_type` у отчёта о поставке НЕТ — она есть только у
 * `contract_templates`.
 */
import type {
    ClientTypeCode,
    SupplyReportFieldCode,
    SupplyTypeCode,
} from '@/modules/entities/konstructor/lib';

/**
 * Уровень привязки шаблона. В БД не хранится: из него выводится пара
 * (`portal_id`, `agent_id`). `common` ⇔ `portal_id IS NULL` («Общий»).
 */
export const SUPPLY_REPORT_TEMPLATE_SCOPE = {
    common: 'common',
    portal: 'portal',
    provider: 'provider',
} as const;

export type SupplyReportTemplateScope =
    (typeof SUPPLY_REPORT_TEMPLATE_SCOPE)[keyof typeof SUPPLY_REPORT_TEMPLATE_SCOPE];

/** Шаблон отчёта о поставке (ответ бэка). */
export interface ISupplyReportTemplate {
    id: string;
    name: string;
    /** Технический код, генерируется бэкендом при создании. */
    code: string;
    /** `null` ⇒ подходит любому типу клиента. */
    client_types: ClientTypeCode[] | null;
    /** `null` ⇒ подходит любому типу поставки. */
    supply_types: SupplyTypeCode[] | null;
    /** `null` ⇒ состав формы берётся из кода. */
    required_fields: SupplyReportFieldCode[] | null;
    /** `null` ⇒ состав формы берётся из кода. */
    optional_fields: SupplyReportFieldCode[] | null;
    description?: string | null;
    is_default: boolean;
    is_active: boolean;
    is_archived: boolean;
    archived_at?: string | null;
    /** `null` ⇒ общий шаблон («Общий» в интерфейсе). */
    portal_id: string | null;
    /** `null` ⇒ годится любому поставщику. */
    agent_id: string | null;
    creator_bitrix_user_id: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    /** Ссылка на скачивание файла шаблона. */
    template_url: string;
    /** Ссылка на демо-файл, если он загружен. */
    demo_url?: string | null;
}

/**
 * Строка списка. Сейчас бэк отдаёт тот же набор колонок, что и для карточки,
 * но алиас оставлен отдельным именем намеренно: когда у списка появится
 * усечённая проекция, менять придётся только этот тип, а не таблицу и хуки.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- шов под будущую усечённую проекцию списка
export interface ISupplyReportTemplateSummary extends ISupplyReportTemplate {}

/** Страница списка: без `total` реальную таблицу админки не построить. */
export interface ISupplyReportTemplatePage {
    items: ISupplyReportTemplate[];
    total: number;
    take: number;
    skip: number;
}

/** Значение по умолчанию и потолок страницы — как в query-DTO бэкенда. */
export const SUPPLY_REPORT_TEMPLATE_PAGE_SIZE = 50;
export const SUPPLY_REPORT_TEMPLATE_PAGE_SIZE_MAX = 200;

/** Query-параметры списка. */
export interface ISupplyReportTemplateQuery {
    portal_id?: string;
    /**
     * «Только общие» (`portal_id IS NULL`) — отдельный флаг: «нет фильтра»
     * и «только общие» — разные запросы.
     */
    only_common?: boolean;
    agent_id?: string;
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
 *
 * Пустые списки сюда НЕ попадают: отсутствие поля = «подходит любому»
 * (на бэке NULL). Нормализация — в
 * `lib/utils/supply-report-template-payload.ts`.
 */
export interface ICreateSupplyReportTemplateDto {
    name: string;
    scope?: SupplyReportTemplateScope;
    portal_id?: string;
    agent_id?: string;
    client_types?: ClientTypeCode[];
    supply_types?: SupplyTypeCode[];
    required_fields?: SupplyReportFieldCode[];
    optional_fields?: SupplyReportFieldCode[];
    description?: string;
    is_default?: boolean;
    is_active?: boolean;
    creator_bitrix_user_id?: string;
    /** DOCX-шаблон. */
    file: File;
    /** Демо-файл (заполненный пример). */
    demo?: File;
}

/**
 * Частичное обновление. Отсутствие поля = «не менять».
 *
 * Сброс списка в «любой»/«как в коде» выражается ПУСТЫМ массивом (бэкенд
 * пишет NULL), а не `null` — поэтому в update пустой массив отправляется,
 * в отличие от create.
 */
export interface IUpdateSupplyReportTemplateDto {
    name?: string;
    /** Пустая строка переводит шаблон в общие. */
    portal_id?: string;
    /** Пустая строка снимает привязку к поставщику. */
    agent_id?: string;
    client_types?: ClientTypeCode[];
    supply_types?: SupplyTypeCode[];
    required_fields?: SupplyReportFieldCode[];
    optional_fields?: SupplyReportFieldCode[];
    description?: string;
    is_default?: boolean;
    is_active?: boolean;
    file?: File;
    demo?: File;
}

export interface ISetSupplyReportTemplatePortalDto {
    portal_id?: string | null;
}

export interface ISetSupplyReportTemplateAgentDto {
    agent_id?: string | null;
}

/**
 * Значения формы до нормализации в DTO (плоские, под react-hook-form +
 * FormFieldRenderer).
 */
export interface ISupplyReportTemplateFormValues {
    name: string;
    scope: SupplyReportTemplateScope;
    portal_id: string;
    agent_id: string;
    client_types: ClientTypeCode[];
    supply_types: SupplyTypeCode[];
    required_fields: SupplyReportFieldCode[];
    optional_fields: SupplyReportFieldCode[];
    description: string;
    is_default: boolean;
    is_active: boolean;
    file?: File | null;
    demo?: File | null;
}
