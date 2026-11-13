export const TRANSCRIPTION_SPEND_CACHE_KEY = 'transcription-spend';
/** Общая страница расхода по порталам. */
export const TRANSCRIPTION_SPEND_PATH = '/statistics/transcription-spend';
/** Страница расхода одного портала. */
export const portalSpendPath = (portalId: number | string): string =>
    `/portal/${portalId}/statistics/transcription-spend`;
/** Карточка транскрипции портала. */
export const portalTranscriptionPath = (portalId: number | string, id: string): string =>
    `/portal/${portalId}/statistics/transcription/${id}`;
