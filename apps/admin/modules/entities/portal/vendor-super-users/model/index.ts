/**
 * Суперпользователи ВЕНДОРА (сотрудники April) на портале клиента.
 *
 * Формы описаны руками: ручки `admin/portal/:portalId/vendor-super-users`
 * ещё не прогнаны через orval. После `pnpm run generate` в
 * `@workspace/nest-admin-api` правка сводится к замене этих объявлений на
 * импорт сгенерированных DTO — имена совпадают с бэком
 * (VendorSuperUserDto, VendorSuperUserSaveDto). Прецедент —
 * `entities/portal/questionnaires` и `entities/pbx/smart/db`.
 *
 * Не путать с настройками видимости портала (`visibility_*_user_ids` во
 * вкладке «Приложения»): те про сотрудников КЛИЕНТА внутри его структуры
 * продаж, и ими распоряжается владелец портала. Эти записи ведёт только
 * April — сотрудник сопровождения получает видимость all, «Смотреть как…»
 * и служебные ссылки.
 */

/** Запись о суперпользователе April на портале. */
export interface VendorSuperUser {
    id: string;
    portalId: number;
    /** Домен портала на момент записи. */
    domain: string;
    /** Bitrix-id сотрудника April на этом портале. */
    bitrixId: number;
    /** Кто это — для людей. */
    comment: string | null;
    /** false — запись есть, прав не даёт. */
    isActive: boolean;
}

/** Заведение или правка. Повторный `bitrixId` обновляет запись. */
export interface VendorSuperUserSave {
    bitrixId: number;
    comment?: string | null;
    isActive?: boolean;
}
