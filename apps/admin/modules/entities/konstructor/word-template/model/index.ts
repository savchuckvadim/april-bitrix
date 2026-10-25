import {
    CreateWordTemplateMultipartDto,
    CreateWordTemplateResponseDto,
    UpdateWordTemplateDto,
    WordTemplateDto,
    WordTemplateFindAllWordTemplatesParams,
    WordTemplateSummaryDto,
} from "@workspace/nest-konstructor-api";
import type {
    ClientTypeCode,
    SupplyTypeCode,
} from '@/modules/entities/konstructor/lib';

/**
 * Критерии подбора шаблона Word КП: поставщик + типы клиента + виды
 * размещения.
 *
 * ПОЧЕМУ ЛОКАЛЬНО, А НЕ ИЗ ГЕНЕРАЦИИ. Поля уже есть в бэкенде
 * (`CreateWordTemplateBodyDto` → `agent_id`, `client_types`,
 * `supply_types`; в `UpdateWordTemplateDto` они приходят через
 * `PartialType`), но сгенерированный клиент тега
 * `konstructor-word-template` их ещё НЕ знает: `pnpm generate` в
 * `packages/nest-konstructor-api` тянет спеку с
 * `http://localhost:3007/docs/api-json`, а бэкенд локально не запущен.
 *
 * Поэтому DTO расширены здесь, а в `lib/api/word-template.helper.ts` эти
 * поля докладываются в multipart ЯВНО. После `pnpm generate` расширение
 * убирается — имена и типы совпадут.
 *
 * ВАЖНО про семантику: у КП автоподбора по этим полям НЕТ. Поля хранятся и
 * редактируются как есть (зафиксированное решение: шаблоны КП не заходят в
 * общий резолвер шаблонов документов).
 */
export interface IWordTemplateCriteria {
    /** ID поставщика (`agents.id`). `null`/пусто ⇒ «для любого поставщика». */
    agent_id?: string | null;
    /** Пусто/`null` ⇒ «для любого типа клиента» (на бэке NULL). */
    client_types?: ClientTypeCode[] | null;
    /** Пусто/`null` ⇒ «для любого вида размещения» (на бэке NULL). */
    supply_types?: SupplyTypeCode[] | null;
}

/**
 * Привязки к порталам (мультиселект в глобальном дереве).
 *
 * У `offer_templates` НЕТ колонки portal_id — привязка живёт в join-таблице
 * `offer_template_portal`. Поэтому «шаблон для нескольких порталов» — это
 * не поле шаблона, а СИНХРОНИЗАЦИЯ привязок:
 * `PUT /word-templates/:id/portals { portal_ids }` после create/update.
 *
 *  - create: `undefined`/пусто — привязок не делаем (кроме `portal_id`, если
 *    он задан — его бэкенд привязывает сам);
 *  - update: `undefined` — не трогать; `[]` — снять все привязки.
 */
export interface IWordTemplatePortalsField {
    portal_ids?: string[];
}

export interface IWordTemplateSummury
    extends WordTemplateSummaryDto,
        IWordTemplateCriteria {}
export interface IWordTemplate extends WordTemplateDto, IWordTemplateCriteria {}

/**
 * Критерии в сгенерированном DTO создания уже есть (регенерация 24.10.2026),
 * но без `null`; форма работает с `null` = «для любого», поэтому поля
 * критериев берём из локального интерфейса, а из DTO их вырезаем.
 */
export interface ICreateWordTemplateDto
    extends Omit<CreateWordTemplateMultipartDto, keyof IWordTemplateCriteria>,
        IWordTemplateCriteria,
        IWordTemplatePortalsField {}

export type INewWordTemplate = CreateWordTemplateResponseDto;

export interface IUpdateWordTemplateDto
    extends UpdateWordTemplateDto,
        IWordTemplateCriteria,
        IWordTemplatePortalsField {}

export interface IWordTemplateFindAllParams
    extends WordTemplateFindAllWordTemplatesParams {
    /** Фильтры критериев: бэкенд уже умеет, генерация — ещё нет. */
    agent_id?: string;
    client_type?: ClientTypeCode;
    supply_type?: SupplyTypeCode;
}

/** Строка `offer_template_portal` — ответ `GET /offer-template-portals/template/:id`. */
export interface IWordTemplatePortalBinding {
    id: string;
    offer_template_id: string;
    portal_id: string;
    is_default: boolean;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
}

/**
 * Выбор пользователя по шаблону — то, что хранит `user_selected_templates`
 * (ответ `GET /word-templates/user/:user_id/portal/:portal_id` → `selected`).
 * Числа, а не строки: так отдаёт `UserSelectedTemplateSummaryDto`.
 */
export interface IUserSelectedTemplateSummary {
    id: number;
    bitrix_user_id: number;
    portal_id: number;
    template_id: number;
    is_current: boolean;
    is_favorite: boolean;
    is_active: boolean;
}

/** Полный ответ «шаблоны глазами пользователя»: список + его выбор. */
export interface IUserWordTemplatesResponse {
    templates: IWordTemplateSummury[];
    selected: IUserSelectedTemplateSummary[];
}

/**
 * Тело ручек `POST /user-selected-templates/{current|favorite|active}`.
 * `bitrix_user_id` передаётся ЯВНО — именно это позволяет админу действовать
 * от лица пользователя портала.
 */
export interface IUserSelectedTemplateRequest {
    bitrix_user_id: number;
    portal_id: number;
    offer_template_id: number;
}

/** Пользователь отдела продаж портала — `POST /bitrix/department/sales`. */
export interface IDepartmentUser {
    ID: string;
    NAME: string;
    LAST_NAME?: string;
    EMAIL?: string;
}
