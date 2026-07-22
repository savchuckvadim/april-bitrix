import type { SmartResponseDto } from '@workspace/nest-admin-api';

/**
 * Ручные типы новых admin-эндпоинтов смартов
 * (`GET /api/admin/pbx/smarts/{id}/details`,
 * `POST /api/admin/pbx/smarts/install-aicall`) — до перегенерации
 * orval-клиента описаны здесь в стиле сгенерированных DTO.
 */

/** Значение enum-поля смарта. */
export interface SmartEnumItem {
    /** Bitrix id значения. */
    id: number;
    /** Отображаемое значение. */
    value: string;
    /** Символьный код значения (xmlId). */
    xmlId?: string;
}

/** UF-поле смарта (живое состояние в Bitrix). */
export interface SmartDetailsField {
    /** Полное UF-имя поля, например `UF_CRM_128_CALL_TYPE`. */
    fieldName: string;
    /** Название поля (русская подпись формы). */
    title: string;
    /** Тип поля Bitrix (string/enumeration/boolean/...). */
    type: string;
    /** Множественное ли поле. */
    multiple: boolean;
    /** Символьный код (xmlId) поля. */
    xmlId?: string;
    /** Значения enum-поля (только для enumeration). */
    items?: SmartEnumItem[];
}

/** Стадия воронки смарта. */
export interface SmartStage {
    /** STATUS_ID стадии, например `DT128_10:NEW`. */
    statusId: string;
    /** Название стадии. */
    name: string;
}

/** Воронка (категория) смарта со стадиями. */
export interface SmartCategory {
    /** Id категории в Bitrix. */
    id: number;
    /** Название категории. */
    name: string;
    /** Стадии категории. */
    stages: SmartStage[];
}

/** Живое состояние смарта в Bitrix. */
export interface SmartBitrixState {
    /** entityTypeId смарта в CRM. */
    entityTypeId: number;
    /** Символьный код типа. */
    code: string;
    /** Название смарта в Bitrix. */
    title: string;
    /** Воронки со стадиями. */
    categories: SmartCategory[];
    /** UF-поля смарта. */
    fields: SmartDetailsField[];
}

/** Ответ `GET /api/admin/pbx/smarts/{id}/details`. */
export interface SmartDetailsResponse {
    /** Строка смарта из таблицы `smarts`. */
    smart: SmartResponseDto;
    /** Домен портала, на котором живёт смарт. */
    domain: string;
    /** Живое состояние в Bitrix; `null` — портал/смарт недоступен (см. error). */
    bitrix?: SmartBitrixState | null;
    /** Ошибка получения живого состояния (если bitrix=null). */
    error?: string;
}

/** Результат `POST /api/admin/pbx/smarts/install-aicall`. */
export interface InstallAicallResult {
    /** entityTypeId смарта на портале. */
    entityTypeId: number;
    /** true — тип создан этим вызовом, false — уже существовал. */
    created: boolean;
    /** UF-имена добавленных полей. */
    fieldsAdded: string[];
    /** UF-имена уже существовавших полей. */
    fieldsExisting: string[];
    /** UF-имена полей, которые не удалось создать. */
    fieldsFailed: string[];
}

/** Const-смарт из реестра галереи (`GET /api/admin/pbx/smarts/registry`). */
export interface ConstSmartRegistryItem {
    /** Ключ установки — передаётся в `POST install-const` как `kind`. */
    kind: string;
    /** `smarts.type` — матчинг установленной строки идёт по паре type+group. */
    type: string;
    /** `smarts.group`. */
    group: string;
    /** Код смарта в Bitrix (`${type}_${group}`). */
    code: string;
    /** Русское название смарта. */
    title: string;
    /** Источник смарта — всегда `const` для этого реестра. */
    source: 'const';
    /** Число полей по const-конфигу (эталон, не факт установки). */
    fieldsCount: number;
    /** Есть ли у смарта воронки/стадии. */
    hasCategories: boolean;
    /** Короткое описание для карточки галереи. */
    description?: string;
}

/** Ответ `GET /api/admin/pbx/smarts/registry`. */
export interface SmartRegistryResponse {
    /** Const-смарты, доступные к установке из констант. */
    items: ConstSmartRegistryItem[];
}

/**
 * Результат `POST /api/admin/pbx/smarts/install-const` — тот же контракт, что
 * у install-aicall (aicall — первый смарт реестра).
 */
export type InstallConstSmartResult = InstallAicallResult;
