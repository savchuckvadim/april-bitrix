import type { OfferPdfFileLink, OfferPdfGenerateResponse } from '../model/types';

/** Подпись ссылки на единственный файл КП — так её видели до списка файлов. */
export const OFFER_PDF_SINGLE_LINK_NAME = 'Открыть PDF';

/** Что показать под кнопкой после формирования: файлы КП и предупреждения бэка. */
export interface OfferPdfOutcome {
    links: OfferPdfFileLink[];
    warnings: string[];
}

/**
 * Ответ генерации → ссылки и предупреждения для экрана. Есть `links` — бэк
 * отдал все файлы КП, показываем их. Нет (прежний бэк или один файл) — одна
 * ссылка на PDF: файл в Битриксе, при его отсутствии файл на сервере.
 * `warnings` нет — пустой список.
 */
export const readOfferPdfResult = (response: OfferPdfGenerateResponse): OfferPdfOutcome => ({
    links: response.links?.length
        ? response.links
        : [{ link: response.bitrixLink ?? response.link, name: OFFER_PDF_SINGLE_LINK_NAME }],
    warnings: response.warnings ?? [],
});
