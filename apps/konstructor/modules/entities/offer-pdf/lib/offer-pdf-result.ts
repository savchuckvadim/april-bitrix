import type { OfferPdfFileLink, OfferPdfGenerateResponse, OfferPdfResponseFile } from '../model/types';

/** Подпись ссылки на единственный файл КП — так её видели до списка файлов. */
export const OFFER_PDF_SINGLE_LINK_NAME = 'Открыть PDF';

/** Что показать под кнопкой после формирования: файлы КП, файлы счетов и предупреждения бэка. */
export interface OfferPdfOutcome {
    /** Файлы КП, затем файлы счетов */
    links: OfferPdfFileLink[];
    warnings: string[];
}

/** Ссылка на файл: Диск Битрикса, при его отсутствии файл на сервере. */
const fileLink = (file: Pick<OfferPdfResponseFile, 'link' | 'bitrixLink'>): string => file.bitrixLink ?? file.link;

/**
 * Ответ генерации → ссылки и предупреждения для экрана. Файлов КП несколько
 * (варианты отдельными документами) — показываем все, каждый под своим именем.
 * Файл один, либо бэк прежний и поля links нет, — одна ссылка «Открыть PDF».
 * Ссылка ведёт на Диск Битрикса, при его отсутствии на файл на сервере. После
 * файлов КП идут файлы счетов (`invoiceLinks`), каждый под своим именем.
 * Полей warnings и invoiceLinks нет — пустые списки.
 */
export const readOfferPdfResult = (response: OfferPdfGenerateResponse): OfferPdfOutcome => {
    const files = response.links ?? [];
    const [single] = files;
    const offerLinks: OfferPdfFileLink[] =
        files.length > 1
            ? files.map(file => ({ link: fileLink(file), name: file.name }))
            : [{ link: fileLink(single ?? response), name: OFFER_PDF_SINGLE_LINK_NAME }];
    const invoiceLinks: OfferPdfFileLink[] = (response.invoiceLinks ?? []).map(file => ({
        link: fileLink(file),
        name: file.name,
    }));
    return { links: [...offerLinks, ...invoiceLinks], warnings: response.warnings ?? [] };
};

/**
 * Можно ли уходить в сделку после формирования: файлы лежат в ней. Не
 * прикрепились (причина в `dealMessage`) — экран остаётся, иначе менеджер
 * потеряет ссылки на файлы и сообщение. Поля нет (прежний бэк) — остаёмся.
 */
export const isOfferPdfSavedToDeal = (response: Pick<OfferPdfGenerateResponse, 'savedToDeal'>): boolean =>
    response.savedToDeal === true;
