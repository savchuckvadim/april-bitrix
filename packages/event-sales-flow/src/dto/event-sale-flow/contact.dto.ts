/**
 * Множественное поле контакта Bitrix (телефон / email).
 * Bitrix хранит такие поля массивом значений с типом.
 * Фронт может прислать запись без TYPE или VALUE — все поля опциональны.
 */
export interface ContactMultifieldDto {
    /** Значение поля (номер телефона или адрес email). */
    VALUE?: string;

    /** Тип значения Bitrix (`WORK`, `MOBILE`, `HOME` и т.д.). */
    TYPE?: string;
}

/**
 * Контакт события. У контакта с фронта может отсутствовать любое поле
 * (даже ID и имя) — DTO намеренно полностью опциональный.
 */
export interface ContactDto {
    /** Идентификатор контакта Bitrix. */
    ID?: number;

    /** Имя контакта. */
    NAME?: string;

    /** Фамилия контакта. */
    LAST_NAME?: string;

    /** Отчество контакта. */
    SECOND_NAME?: string;

    /** Телефоны контакта — массив множественных полей Bitrix. */
    PHONE?: ContactMultifieldDto[];

    /** Email контакта — массив множественных полей Bitrix. */
    EMAIL?: ContactMultifieldDto[];

    /** Должность контакта. */
    POST?: string;

    /** Комментарий по контакту. */
    COMMENTS?: string;

    /** Идентификатор компании, к которой привязан контакт. */
    COMPANY_ID?: string;

    /** Идентификатор ответственного за контакт сотрудника. */
    ASSIGNED_BY_ID?: string;
}
