import { IBXUser } from '../../shared/bitrix/bitrix.interface';

export interface MinimalUserDto {
    /**
     * Идентификатор пользователя Bitrix. Минимальная форма пользователя —
     * передаётся, когда нужен только ID (ответственный, автор плана).
     */
    ID: number;
}

export interface FullUserDto extends IBXUser {
    /** Идентификатор пользователя Bitrix. */
    ID: number;

    /** Признак активности пользователя в портале. */
    ACTIVE: boolean;

    /** Дата регистрации пользователя в портале (ISO 8601). */
    DATE_REGISTER: string;

    /** Email пользователя. */
    EMAIL?: string;

    /** Признак того, что пользователь сейчас онлайн (`Y` / `N`). */
    IS_ONLINE?: string;

    /** Дата последней активности пользователя (ISO 8601). */
    LAST_ACTIVITY_DATE?: string;

    /** Дата последнего входа пользователя (ISO 8601). */
    LAST_LOGIN?: string;

    /** Фамилия пользователя. */
    LAST_NAME?: string;

    /** Имя пользователя. */
    NAME?: string;

    /** Дата рождения пользователя (ISO 8601). */
    PERSONAL_BIRTHDAY?: string;

    /** Город пользователя. */
    PERSONAL_CITY?: string;

    /** Пол пользователя (`M` / `F`). */
    PERSONAL_GENDER?: string;

    /** Мобильный телефон пользователя. */
    PERSONAL_MOBILE?: string;

    /** Ссылка на фото пользователя. */
    PERSONAL_PHOTO?: string;

    /** Персональный сайт пользователя. */
    PERSONAL_WWW?: string;

    /** Отчество пользователя. */
    SECOND_NAME?: string;

    /** Метки времени изменения записи пользователя. */
    TIMESTAMP_X?: string[];

    /** Идентификаторы подразделений пользователя в портале. */
    UF_DEPARTMENT: number[];
}

export type UserDto = MinimalUserDto | FullUserDto;
