import type { OfferPdfFileLink, OfferPdfGenerateResponse, OfferPdfResponseFile } from '../model/types';

/** Подпись ссылки на единственный файл КП — так её видели до списка файлов. */
export const OFFER_PDF_SINGLE_LINK_NAME = 'Открыть PDF';

/** Что показать под кнопкой после формирования: файлы КП и предупреждения бэка. */
export interface OfferPdfOutcome {
    links: OfferPdfFileLink[];
    warnings: string[];
}

/** Ссылка на файл: Диск Битрикса, при его отсутствии файл на сервере. */
const fileLink = (file: Pick<OfferPdfResponseFile, 'link' | 'bitrixLink'>): string => file.bitrixLink ?? file.link;

/**
 * Ответ генерации → ссылки и предупреждения для экрана. Файлов несколько
 * (варианты отдельными документами) — показываем все, каждый под своим именем.
 * Файл один, либо бэк прежний и поля  нет, — одна ссылка «Открыть PDF».
 * Ссылка ведёт на Диск Битрикса, при его отсутствии на файл на сервере.
 *  нет — пустой список.
 */
export const readOfferPdfResult = (response: OfferPdfGenerateResponse): OfferPdfOutcome => {
    const files = response.links ?? [];
    const [single] = files;
    const links: OfferPdfFileLink[] =
        files.length > 1
            ? files.map(file => ({ link: fileLink(file), name: file.name }))
            : [{ link: fileLink(single ?? response), name: OFFER_PDF_SINGLE_LINK_NAME }];
    return { links, warnings: response.warnings ?? [] };
};
