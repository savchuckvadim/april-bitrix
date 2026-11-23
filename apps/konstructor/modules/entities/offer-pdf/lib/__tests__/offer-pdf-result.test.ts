import { describe, expect, it } from 'vitest';
import type { OfferPdfGenerateResponse } from '../../model/types';
import { OFFER_PDF_SINGLE_LINK_NAME, readOfferPdfResult } from '../offer-pdf-result';

/** Ответ прежнего бэка: один файл, без links и warnings. */
const oldResponse: OfferPdfGenerateResponse = {
    link: 'https://server.test/kp.pdf',
    fileName: 'kp.pdf',
    templateCode: 'classic',
    durationMs: 1200,
    size: 2048,
    missingAssets: [],
    savedToDeal: true,
    bitrixLink: 'https://portal.test/disk/kp.pdf',
    dealMessage: null,
};

describe('разбор ответа генерации PDF-КП', () => {
    it('прежний ответ без links и warnings — одна ссылка на файл в Битриксе, предупреждений нет', () => {
        expect(readOfferPdfResult(oldResponse)).toEqual({
            links: [{ link: 'https://portal.test/disk/kp.pdf', name: OFFER_PDF_SINGLE_LINK_NAME }],
            warnings: [],
        });
    });

    it('файла в Битриксе нет — ссылка на файл на сервере', () => {
        const outcome = readOfferPdfResult({ ...oldResponse, bitrixLink: null, savedToDeal: false });
        expect(outcome.links).toEqual([{ link: 'https://server.test/kp.pdf', name: OFFER_PDF_SINGLE_LINK_NAME }]);
    });

    it('links и warnings есть — показываются все файлы и все предупреждения', () => {
        const outcome = readOfferPdfResult({
            ...oldResponse,
            links: [
                { link: 'https://portal.test/disk/kp-buh.pdf', name: 'КП: Бухгалтеру' },
                { link: 'https://portal.test/disk/kp-ur.pdf', name: 'КП: Юристу' },
            ],
            warnings: ['Сроки вариантов различаются', 'Скидки вариантов различаются'],
        });
        expect(outcome.links.map(item => item.name)).toEqual(['КП: Бухгалтеру', 'КП: Юристу']);
        expect(outcome.warnings).toEqual(['Сроки вариантов различаются', 'Скидки вариантов различаются']);
    });

    it('links пустой — поведение прежнее: одна ссылка на файл', () => {
        const outcome = readOfferPdfResult({ ...oldResponse, links: [], warnings: [] });
        expect(outcome.links).toEqual([{ link: 'https://portal.test/disk/kp.pdf', name: OFFER_PDF_SINGLE_LINK_NAME }]);
        expect(outcome.warnings).toEqual([]);
    });

    it('только warnings — ссылка на файл остаётся, предупреждения добавляются', () => {
        const outcome = readOfferPdfResult({ ...oldResponse, warnings: ['Сроки вариантов различаются'] });
        expect(outcome.links).toHaveLength(1);
        expect(outcome.warnings).toEqual(['Сроки вариантов различаются']);
    });
});
