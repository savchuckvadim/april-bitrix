import { describe, expect, it } from 'vitest';
import {
    buildFiveKSummary,
    buildPortalFieldPayload,
    toPortalValue,
} from './check-presentation.persist';

const TITLES = {
    op_5k_client_what: 'КЛИЕНТ: Что хочет?:',
    op_5k_concurent: 'КОНКУРЕНТ: По каким критериям нас сравнивают?:',
};

describe('buildFiveKSummary', () => {
    it('собирает только отвеченные «К», построчно и по порядку', () => {
        const summary = buildFiveKSummary(
            {
                op_5k_concurent: 'Консультант, цена',
                op_5k_client_what: 'Нормативка',
                xo_impression: 'не пятёрка — не попадает',
            },
            TITLES,
        );
        expect(summary).toBe(
            'КЛИЕНТ: Что хочет?: Нормативка\n' +
                'КОНКУРЕНТ: По каким критериям нас сравнивают?: Консультант, цена',
        );
    });

    it('ни одного ответа — сводки нет, пустую строку не пишем', () => {
        expect(buildFiveKSummary({}, TITLES)).toBeNull();
        expect(
            buildFiveKSummary({ op_5k_client_what: '  ' }, TITLES),
        ).toBeNull();
    });
});

describe('buildPortalFieldPayload', () => {
    it('пишет только под существующие в слепке поля', () => {
        const payload = buildPortalFieldPayload({
            answers: { known: 'да', unknown: 'нет', flag: true },
            resolveKey: code =>
                code === 'known' || code === 'flag' ? `UF_CRM_${code}` : null,
        });
        expect(payload).toEqual({ UF_CRM_known: 'да', UF_CRM_flag: 'Y' });
    });
});

describe('toPortalValue', () => {
    it('булево — Y/N, массивы пропускаются, пустое — null', () => {
        expect(toPortalValue(false)).toBe('N');
        expect(toPortalValue(['a'])).toBeNull();
        expect(toPortalValue(' текст ')).toBe('текст');
        expect(toPortalValue('')).toBeNull();
    });
});
