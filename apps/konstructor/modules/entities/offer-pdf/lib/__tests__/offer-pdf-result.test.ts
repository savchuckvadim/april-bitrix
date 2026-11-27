import { describe, expect, it } from 'vitest';
import type { OfferPdfGenerateResponse } from '../../model/types';
import { OFFER_PDF_SINGLE_LINK_NAME, isOfferPdfSavedToDeal, readOfferPdfResult } from '../offer-pdf-result';

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
                { link: 'https://server.test/kp-buh.pdf', bitrixLink: 'https://portal.test/disk/kp-buh.pdf', name: 'КП: Бухгалтеру' },
                { link: 'https://server.test/kp-ur.pdf', bitrixLink: null, name: 'КП: Юристу' },
            ],
            warnings: ['Сроки вариантов различаются', 'Скидки вариантов различаются'],
        });
        expect(outcome.links.map(item => item.name)).toEqual(['КП: Бухгалтеру', 'КП: Юристу']);
        // файл на Диске — ссылка на Диск, файла на Диске нет — ссылка на сервер
        expect(outcome.links.map(item => item.link)).toEqual([
            'https://portal.test/disk/kp-buh.pdf',
            'https://server.test/kp-ur.pdf',
        ]);
        expect(outcome.warnings).toEqual(['Сроки вариантов различаются', 'Скидки вариантов различаются']);
    });

    it('links пустой — поведение прежнее: одна ссылка на файл', () => {
        const outcome = readOfferPdfResult({ ...oldResponse, links: [], warnings: [] });
        expect(outcome.links).toEqual([{ link: 'https://portal.test/disk/kp.pdf', name: OFFER_PDF_SINGLE_LINK_NAME }]);
        expect(outcome.warnings).toEqual([]);
    });

    it('новый бэк с одним файлом в links — та же одна ссылка «Открыть PDF» на Диск', () => {
        const outcome = readOfferPdfResult({
            ...oldResponse,
            links: [{ link: 'https://server.test/kp.pdf', bitrixLink: 'https://portal.test/disk/kp.pdf', name: 'КП Гарант' }],
            warnings: [],
        });
        expect(outcome.links).toEqual([{ link: 'https://portal.test/disk/kp.pdf', name: OFFER_PDF_SINGLE_LINK_NAME }]);
    });

    it('invoiceLinks есть — ссылки на счета идут после файлов КП, каждая под своим именем', () => {
        const outcome = readOfferPdfResult({
            ...oldResponse,
            invoiceLinks: [
                { link: 'https://server.test/invoice-1.pdf', bitrixLink: 'https://portal.test/disk/invoice-1.pdf', name: 'Счёт № 15', fileName: 'invoice-1.pdf', size: 900 },
                { link: 'https://server.test/invoice-2.pdf', bitrixLink: null, name: 'Счёт № 16', fileName: 'invoice-2.pdf', size: 910 },
            ],
        });
        expect(outcome.links).toEqual([
            { link: 'https://portal.test/disk/kp.pdf', name: OFFER_PDF_SINGLE_LINK_NAME },
            { link: 'https://portal.test/disk/invoice-1.pdf', name: 'Счёт № 15' },
            { link: 'https://server.test/invoice-2.pdf', name: 'Счёт № 16' },
        ]);
    });

    it('несколько файлов КП и счёт — все КП, затем счёт; предупреждение о счёте показывается', () => {
        const outcome = readOfferPdfResult({
            ...oldResponse,
            links: [
                { link: 'https://server.test/a.pdf', name: 'КП: Бухгалтеру' },
                { link: 'https://server.test/b.pdf', name: 'КП: Юристу' },
            ],
            invoiceLinks: [{ link: 'https://server.test/i.pdf', name: 'Счёт' }],
            warnings: ['Счёт не сформирован: нет шаблона счёта'],
        });
        expect(outcome.links.map(item => item.name)).toEqual(['КП: Бухгалтеру', 'КП: Юристу', 'Счёт']);
        expect(outcome.warnings).toEqual(['Счёт не сформирован: нет шаблона счёта']);
    });

    it('invoiceLinks пустой или нет — как прежде', () => {
        expect(readOfferPdfResult({ ...oldResponse, invoiceLinks: [] }).links).toHaveLength(1);
        expect(readOfferPdfResult(oldResponse).links).toHaveLength(1);
    });

    it('только warnings — ссылка на файл остаётся, предупреждения добавляются', () => {
        const outcome = readOfferPdfResult({ ...oldResponse, warnings: ['Сроки вариантов различаются'] });
        expect(outcome.links).toHaveLength(1);
        expect(outcome.warnings).toEqual(['Сроки вариантов различаются']);
    });
});

describe('уход в сделку после формирования PDF-КП', () => {
    it('файлы прикреплены к сделке — можно уходить', () => {
        expect(isOfferPdfSavedToDeal(oldResponse)).toBe(true);
    });

    it('файлы не прикрепились — остаёмся, чтобы увидеть ссылки и причину', () => {
        expect(isOfferPdfSavedToDeal({ ...oldResponse, savedToDeal: false, dealMessage: 'нет доступа' })).toBe(false);
    });

    it('прежний бэк без поля savedToDeal — остаёмся', () => {
        const { savedToDeal: _omitted, ...legacy } = oldResponse;
        expect(isOfferPdfSavedToDeal(legacy)).toBe(false);
    });
});
