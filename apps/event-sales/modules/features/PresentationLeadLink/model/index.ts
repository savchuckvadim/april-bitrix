import type {
    LeadRequestSyncDtoSiteStageCode,
    LeadRequestSyncDtoSiteStatusCode,
} from '@workspace/nest-event-sales-api';

/**
 * Доменные алиасы generated-типов связи «презентация ↔ заявка».
 * Коды статусов типизированы на бэке (pbx-lead-request enum) и доехали
 * литеральными union'ами — magic strings исключены и здесь.
 */
export type PresentationSyncSiteStatusCode = LeadRequestSyncDtoSiteStatusCode;
export type PresentationSyncSiteStageCode = LeadRequestSyncDtoSiteStageCode;

/** Кандидат на связь: открытый связанный лид/заявка клиента. */
export interface PresentationLeadCandidate {
    id: number;
    title: string;
    /** Распознан как заявка (поля лидогена) — бейдж «Заявка»/«Лид». */
    isRequest: boolean;
    responsibleName: string | null;
}
