/**
 * Типы шаблона счёта.
 *
 * Основа — СГЕНЕРИРОВАННЫЙ Orval-клиент (тег `invoice-templates`), поэтому
 * базовые поля берутся из него, а не пишутся руками.
 *
 * НО: снимок swagger, из которого сгенерирован клиент, снят ДО того, как бэк
 * добавил шаблонам счетов критерии подбора `client_types` / `supply_types`
 * (см. фазу invoice-offer-criteria: create/update DTO и query-фильтры этих
 * полей на бэке уже есть). Регенерация требует поднятого бэкенда, поэтому
 * здесь сгенерированные типы РАСШИРЯЮТСЯ этими полями руками.
 *
 * ЗАМЕНА ПОСЛЕ `pnpm generate` — механическая: убрать блоки
 * `client_types`/`supply_types` ниже, если сгенерированные DTO их уже несут.
 * Ни хуки, ни UI трогать не придётся — они зависят только от имён отсюда.
 *
 * ID — всегда СТРОКИ. В БД это BIGINT, наружу уходит `String(row.id)`;
 * приводить к number нельзя (потеря точности выше 2^53).
 */
import type {
    CreateInvoiceTemplateMultipartDto,
    InvoiceTemplateFindAllParams,
    InvoiceTemplateResponseDto,
    UpdateInvoiceTemplateDto,
} from '@workspace/nest-konstructor-api';
import {
    CreateInvoiceTemplateMultipartDtoType,
    CreateInvoiceTemplateMultipartDtoVisibility,
} from '@workspace/nest-konstructor-api';
import type {
    ClientTypeCode,
    SupplyTypeCode,
} from '@/modules/entities/konstructor/lib';

/** Видимость шаблона счёта. У счетов колонка `visibility` ЕСТЬ (в отличие от договоров). */
export const INVOICE_TEMPLATE_VISIBILITY =
    CreateInvoiceTemplateMultipartDtoVisibility;
export type InvoiceTemplateVisibility =
    (typeof INVOICE_TEMPLATE_VISIBILITY)[keyof typeof INVOICE_TEMPLATE_VISIBILITY];

/** Тип файла шаблона. */
export const INVOICE_TEMPLATE_TYPE = CreateInvoiceTemplateMultipartDtoType;
export type InvoiceTemplateType =
    (typeof INVOICE_TEMPLATE_TYPE)[keyof typeof INVOICE_TEMPLATE_TYPE];

/**
 * Критерии подбора шаблона счёта.
 *
 * `null` (и пустой список, который на бэке нормализуется в NULL) означает
 * «подходит любому» — это НЕ «ничего не выбрано» и не ошибка валидации.
 */
export interface IInvoiceTemplateCriteria {
    client_types?: ClientTypeCode[] | null;
    supply_types?: SupplyTypeCode[] | null;
}

/**
 * Поля ответа, тип которых в сгенерированном клиенте ПОТЕРЯН.
 *
 * Orval развернул каждое `@nullable`-поле ответа в `{ [key: string]: unknown }`
 * вместо `string | null`: в спеке у них нет `type`, и генератор выдал пустой
 * объектный тип. По факту это строки (`portal_id`, `agent_id` — bigint`и через
 * `String()`; `created_at`/`updated_at` — ISO-даты), поэтому здесь они
 * переопределяются. Без этого ни одно из них нельзя ни отрендерить, ни
 * передать в `new Date()`.
 *
 * ПОСЛЕ ИСПРАВЛЕНИЯ СПЕКИ И РЕГЕНЕРАЦИИ этот блок удаляется целиком.
 */
type InvoiceTemplateNullableStringFields =
    | 'description'
    | 'archived_at'
    | 'portal_id'
    | 'agent_id'
    | 'creator_bitrix_user_id'
    | 'created_at'
    | 'updated_at';

interface IInvoiceTemplateNullableStrings {
    description?: string | null;
    archived_at?: string | null;
    /** `null` — общий шаблон. ID строковый: bigint в number не влезает. */
    portal_id?: string | null;
    /** `null` — подходит любому поставщику. */
    agent_id?: string | null;
    creator_bitrix_user_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

/**
 * Критерии в сгенерированных DTO уже есть (регенерация 24.10.2026), но без
 * `null` на создании/обновлении: пустой список бэк нормализует в NULL сам.
 * Форма работает с `null` = «подходит любому», поэтому поля критериев берём
 * из локального интерфейса, а из DTO их вырезаем.
 */
type InvoiceTemplateCriteriaFields = keyof IInvoiceTemplateCriteria;

/** Строка/карточка шаблона счёта. */
export interface IInvoiceTemplate
    extends Omit<
            InvoiceTemplateResponseDto,
            InvoiceTemplateNullableStringFields | InvoiceTemplateCriteriaFields
        >,
        IInvoiceTemplateNullableStrings,
        IInvoiceTemplateCriteria {}

/** Полезная нагрузка создания: multipart, файл обязателен. */
export interface ICreateInvoiceTemplateDto
    extends Omit<CreateInvoiceTemplateMultipartDto, InvoiceTemplateCriteriaFields>,
        IInvoiceTemplateCriteria {}

/** Полезная нагрузка обновления: multipart, файл опционален. */
export interface IUpdateInvoiceTemplateDto
    extends Omit<UpdateInvoiceTemplateDto, InvoiceTemplateCriteriaFields>,
        IInvoiceTemplateCriteria {
    /** Новый файл шаблона. Не передан — файл не меняется. */
    file?: Blob;
}

/**
 * Параметры списка. Фильтрация СЕРВЕРНАЯ: `is_archived` на бэке скрывает
 * архив по умолчанию, поэтому «показать архив» — это параметр запроса,
 * а не переключение уже полученного массива на клиенте.
 */
export interface IInvoiceTemplateFindAllParams
    extends InvoiceTemplateFindAllParams {
    client_type?: ClientTypeCode;
    supply_type?: SupplyTypeCode;
}

/** Значения формы шаблона счёта. */
export interface IInvoiceTemplateFormValues {
    name: string;
    visibility: InvoiceTemplateVisibility;
    portal_id: string;
    agent_id: string;
    client_types: ClientTypeCode[];
    supply_types: SupplyTypeCode[];
    description: string;
    type: InvoiceTemplateType;
    is_default: boolean;
    is_active: boolean;
    file?: Blob;
}
