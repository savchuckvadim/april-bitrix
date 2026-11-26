import { describe, expect, it } from 'vitest';
import type { Portal } from '../../../portal';
import {
    PRESENTATION_BASE_FIELD_CODE,
    PRESENTATION_DEAL_SELECT,
    buildPresentationDealsQuery,
    formatPresentationDate,
    presentationLabel,
    toPresentationDeals,
} from '../presentation-deals.util';

interface PortalOptions {
    withField?: boolean;
    withCategory?: boolean;
}

/** Слепок портала: поле сделки `to_base_sales` и воронка `sales_presentation` (или без них). */
const portalOf = ({ withField = true, withCategory = true }: PortalOptions = {}): Portal =>
    ({
        bitrixDeal: {
            bitrixfields: [
                { code: 'op_inn', bitrixId: 'OP_INN', items: [] },
                ...(withField ? [{ code: PRESENTATION_BASE_FIELD_CODE, bitrixId: 'TO_BASE_SALES', items: [] }] : []),
            ],
            categories: [
                { code: 'sales_base', bitrixId: '0' },
                ...(withCategory ? [{ code: 'sales_presentation', bitrixId: '12' }] : []),
            ],
        },
    }) as unknown as Portal;

describe('запрос сделок презентации', () => {
    it('воронка презентаций из слепка, ссылка на текущую сделку в обоих видах значения и компания', () => {
        const query = buildPresentationDealsQuery({ portal: portalOf(), dealId: 555, companyId: 77 });
        expect(query?.filter).toEqual({
            CATEGORY_ID: '12',
            COMPANY_ID: '77',
            UF_CRM_TO_BASE_SALES: ['555', 'D_555'],
        });
    });

    it('поля ID, TITLE, DATE_CREATE, STAGE_ID и сортировка по дате создания по убыванию', () => {
        const query = buildPresentationDealsQuery({ portal: portalOf(), dealId: 555 });
        expect(query?.select).toEqual(['ID', 'TITLE', 'DATE_CREATE', 'STAGE_ID']);
        expect(query?.select).toBe(PRESENTATION_DEAL_SELECT);
        expect(query?.order).toEqual({ DATE_CREATE: 'DESC' });
    });

    it('компании нет — фильтр по компании не ставится', () => {
        for (const companyId of [undefined, null, 0]) {
            const query = buildPresentationDealsQuery({ portal: portalOf(), dealId: 555, companyId });
            expect(query?.filter).not.toHaveProperty('COMPANY_ID');
        }
    });

    it('на портале нет поля to_base_sales — запроса нет, без ошибки', () => {
        expect(buildPresentationDealsQuery({ portal: portalOf({ withField: false }), dealId: 555 })).toBeNull();
    });

    it('на портале нет воронки sales_presentation — запроса нет, без ошибки', () => {
        expect(buildPresentationDealsQuery({ portal: portalOf({ withCategory: false }), dealId: 555 })).toBeNull();
    });

    it('слепка портала нет — запроса нет', () => {
        expect(buildPresentationDealsQuery({ portal: null, dealId: 555 })).toBeNull();
    });

    it('сделки нет — запроса нет', () => {
        expect(buildPresentationDealsQuery({ portal: portalOf(), dealId: 0 })).toBeNull();
    });
});

describe('сделки презентации из строк Битрикса', () => {
    const row = (id: number | string, patch: Record<string, string> = {}) => ({
        ID: id as number,
        TITLE: `Презентация ${id}`,
        DATE_CREATE: '2026-11-20T10:00:00+03:00',
        STAGE_ID: 'C12:NEW',
        ...patch,
    });

    it('свежие первыми, независимо от порядка ответа', () => {
        const deals = toPresentationDeals([
            row(601, { DATE_CREATE: '2026-11-18T10:00:00+03:00' }),
            row(603, { DATE_CREATE: '2026-11-25T08:00:00+03:00' }),
            row(602, { DATE_CREATE: '2026-11-20T10:00:00+03:00' }),
        ]);
        expect(deals.map(deal => deal.id)).toEqual([603, 602, 601]);
    });

    it('равные даты — с большим номером первой', () => {
        expect(toPresentationDeals([row(601), row(605)]).map(deal => deal.id)).toEqual([605, 601]);
    });

    it('поля сделки: номер числом, название, дата и стадия', () => {
        expect(toPresentationDeals([row('601')])).toEqual([
            { id: 601, title: 'Презентация 601', createdAt: '2026-11-20T10:00:00+03:00', stageId: 'C12:NEW' },
        ]);
    });

    it('пустое название заменяется номером сделки', () => {
        expect(toPresentationDeals([row(601, { TITLE: '  ' })])[0]?.title).toBe('Сделка №601');
    });

    it('повторы и строки без номера отбрасываются', () => {
        const deals = toPresentationDeals([row(601), row(601), { TITLE: 'Без номера' }, row(0)]);
        expect(deals.map(deal => deal.id)).toEqual([601]);
    });

    it('ответа нет — пустой список', () => {
        expect(toPresentationDeals([])).toEqual([]);
    });
});

describe('подпись презентации', () => {
    it('дата Битрикса → дд.мм.гггг без сдвига зоны', () => {
        expect(formatPresentationDate('2026-11-20T23:30:00+03:00')).toBe('20.11.2026');
    });

    it('даты нет или другой вид — пустая строка', () => {
        expect(formatPresentationDate('')).toBe('');
        expect(formatPresentationDate('вчера')).toBe('');
    });

    it('название и дата', () => {
        expect(presentationLabel({ title: 'Презентация «Гарант»', createdAt: '2026-11-20T10:00:00+03:00' })).toBe(
            'Презентация «Гарант» (20.11.2026)',
        );
    });

    it('без даты — одно название', () => {
        expect(presentationLabel({ title: 'Презентация «Гарант»', createdAt: '' })).toBe('Презентация «Гарант»');
    });
});
