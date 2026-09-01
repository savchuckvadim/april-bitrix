/**
 * БОГАТЫЙ IBXLead — зеркало back/libs/bitrix/src/domain/crm/lead/interface/
 * bx-lead.interface.ts (1:1).
 *
 * На бэке живут ДВЕ декларации IBXLead, и это не случайность:
 *  - эта, богатая — её видит `import { IBXLead } from '@/modules/bitrix'`
 *    (баррель libs/bitrix отдаёт crm/lead-вариант), ею типизированы
 *    EventReportContext и init-типы;
 *  - минимальная (bitrix.interface.ts) — её импортирует lead.dto по прямому
 *    пути domain/interfaces.
 * Пакет повторяет обе, чтобы зеркала context/init совпадали с бэком: у
 * богатой индекс-подпись включает string[]/boolean/undefined, и реальный
 * лид с PHONE?: string[] в минимальную не влезает.
 */
export interface IBXLead {
    [key: string]: string | number | string[] | number[] | boolean | undefined;
    ID: number;
    TITLE: string;
    NAME: string;
    LAST_NAME: string;
    SECOND_NAME: string;
    STATUS_ID: string;
    SOURCE_ID: string;
    COMPANY_TITLE: string;
    COMPANY_ID: string;
    CONTACT_ID: string;
    ASSIGNED_BY_ID: string;
    CREATED_BY_ID: string;
    COMMENTS: string;
    PHONE?: string[];
    EMAIL?: string[];
}
