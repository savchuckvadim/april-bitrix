import { IBXLead } from '../../shared/bitrix/bitrix.interface';

export interface LeadDto extends IBXLead {
    /** Идентификатор лида Bitrix. */
    ID: number;

    /** Название лида. */
    TITLE: string;

    /** Ссылка на квест/опрос, из которого пришёл лид. */
    UF_CRM_LEAD_QUEST_URL: string;

    /** Идентификатор источника лида. */
    UF_CRM_LEAD_SOURCE_ID: string;

    /** Описание источника лида. */
    UF_CRM_LEAD_SOURCE_DESCRIPTION: string;

    /** Название источника лида. */
    UF_CRM_LEAD_SOURCE_NAME: string;

    /** Тип источника лида. */
    UF_CRM_LEAD_SOURCE_TYPE: string;

    /** Идентификатор типа источника лида. */
    UF_CRM_LEAD_SOURCE_TYPE_ID: string;

    [key: string]: string | number;
}
