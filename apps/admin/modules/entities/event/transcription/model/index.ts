import type {
    AdminTranscriptionStoreFindPageParams,
    TranscriptionAdminListItemDto,
    TranscriptionStoreDto,
} from "@workspace/nest-admin-api";

/** Транскрипция целиком — для карточки (с текстом). */
export type TranscriptionEntity = TranscriptionStoreDto;

/** Строка списка — без текста разговора. */
export type TranscriptionListItem = TranscriptionAdminListItemDto;

/** Фильтры списка: всё, кроме номера и размера страницы. */
export type TranscriptionListFilters = Omit<
    AdminTranscriptionStoreFindPageParams,
    'page' | 'pageSize'
>;
