import { describe, expect, it } from 'vitest';
import {
    buildRenewalPdfDevNote,
    buildRenewalPdfRows,
} from './renewal-pdf.rows';
import {
    DEFAULT_RENEWAL_OFFER,
    type RenewalOffer,
} from '../../model/renewal-offer.model';

const offer = (patch: Partial<RenewalOffer> = {}): RenewalOffer => ({
    ...DEFAULT_RENEWAL_OFFER,
    ...patch,
});

describe('buildRenewalPdfRows: состав таблицы', () => {
    it('по умолчанию печатает пакет приложений и AI-сервис', () => {
        const rows = buildRenewalPdfRows(offer());
        expect(rows.monthly.map((row) => row.title)).toEqual([
            'Приложения по продажам',
            'AI-сервис — 3 сотрудника',
        ]);
    });

    it('выключенная услуга в таблицу не попадает', () => {
        const rows = buildRenewalPdfRows(
            offer({ salesIncluded: false, aiIncluded: false }),
        );
        expect(rows.monthly).toHaveLength(0);
        expect(rows.monthlyTotal).toBe('0 ₽');
    });

    it('персональный менеджер печатается своей ценой', () => {
        const rows = buildRenewalPdfRows(
            offer({ managerIncluded: true, managerPrice: 8500 }),
        );
        const manager = rows.monthly.find(
            (row) => row.title === 'Персональный менеджер',
        );
        expect(manager?.price).toBe('8 500 ₽');
    });

    it('цена AI-сервиса считается по числу сотрудников', () => {
        const rows = buildRenewalPdfRows(offer({ aiEmployees: 7 }));
        const ai = rows.monthly.find((row) => row.title.startsWith('AI'));
        // 7500 за трёх + 4 × 1000
        expect(ai?.price).toBe('11 500 ₽');
        expect(ai?.title).toBe('AI-сервис — 7 сотрудников');
    });

    it('в примечании AI-сервиса виден коридор состава', () => {
        const rows = buildRenewalPdfRows(offer({ aiEmployees: 7 }));
        const ai = rows.monthly.find((row) => row.title.startsWith('AI'));
        expect(ai?.note).toContain('от 5 до 9 человек');
    });

    it('без коридора примечание про состав не пишется', () => {
        const rows = buildRenewalPdfRows(offer({ aiFreeDelta: 0 }));
        const ai = rows.monthly.find((row) => row.title.startsWith('AI'));
        expect(ai?.note).not.toContain('менять');
    });
});

describe('buildRenewalPdfRows: итоги и скидка', () => {
    it('итог совпадает с суммой включённых услуг', () => {
        const rows = buildRenewalPdfRows(
            offer({ salesPrice: 6500, managerIncluded: true }),
        );
        // 6500 + 7500 + 10000
        expect(rows.monthlyTotal).toBe('24 000 ₽');
    });

    it('скидка выносится отдельной подписью и уже учтена в итоге', () => {
        const rows = buildRenewalPdfRows(
            offer({ adjustment: -2000, adjustmentLabel: 'Скидка за год' }),
        );
        expect(rows.adjustment).toEqual({
            label: 'Скидка за год',
            value: '−2 000 ₽',
        });
        // 5000 + 7500 − 2000
        expect(rows.monthlyTotal).toBe('10 500 ₽');
    });

    it('без скидки подписи нет', () => {
        expect(buildRenewalPdfRows(offer()).adjustment).toBeNull();
    });
});

describe('buildRenewalPdfRows: дополнительные услуги', () => {
    it('месячные и разовые услуги разводятся по разным таблицам', () => {
        const rows = buildRenewalPdfRows(
            offer({
                extras: [
                    { title: 'Телефония', price: 3000, period: 'month' },
                    { title: 'Обучение', price: 15000, period: 'once' },
                ],
            }),
        );
        expect(rows.monthly.map((row) => row.title)).toContain('Телефония');
        expect(rows.once.map((row) => row.title)).toEqual(['Обучение']);
        expect(rows.onceTotal).toBe('15 000 ₽');
    });

    it('разовая услуга в месячный итог не входит', () => {
        const rows = buildRenewalPdfRows(
            offer({
                extras: [{ title: 'Обучение', price: 15000, period: 'once' }],
            }),
        );
        // 5000 + 7500, без 15000
        expect(rows.monthlyTotal).toBe('12 500 ₽');
    });

    it('услуга без названия в документ не печатается', () => {
        const rows = buildRenewalPdfRows(
            offer({
                extras: [
                    { title: '   ', price: 0, period: 'month' },
                    { title: '', price: 500, period: 'once' },
                ],
            }),
        );
        expect(rows.monthly).toHaveLength(2);
        expect(rows.once).toHaveLength(0);
    });

    it('без разовых услуг таблицы и итога разово нет', () => {
        const rows = buildRenewalPdfRows(offer());
        expect(rows.once).toHaveLength(0);
        expect(rows.onceTotal).toBeNull();
    });
});

describe('buildRenewalPdfDevNote', () => {
    it('с часами в пакете называет объём и цену часа сверх', () => {
        const note = buildRenewalPdfDevNote(offer());
        expect(note).toContain('30 часов');
        expect(note).toContain('2 000 ₽');
    });

    it('без часов в пакете остаётся только цена часа', () => {
        const note = buildRenewalPdfDevNote(offer({ devHours: 0 }));
        expect(note).toBe('Разработка — 2 000 ₽ за час.');
    });

    it('выключенная разработка сноски не даёт', () => {
        expect(buildRenewalPdfDevNote(offer({ devIncluded: false }))).toBeNull();
    });
});
