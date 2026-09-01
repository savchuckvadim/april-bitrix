import { describe, expect, it } from 'vitest';
import {
    buildFiveKSummary,
    buildPortalFieldPayload,
    toPortalValue,
    translateSurveyCodes,
} from './check-presentation.persist';
import { CheckPresentationFieldType } from '../type/check-presentation-type';

const TITLES = {
    op_5k_client: 'КЛИЕНТ:',
    op_5k_competitor: 'КОНКУРЕНТ:',
};

describe('buildFiveKSummary', () => {
    it('собирает только отвеченные «К», построчно и по порядку', () => {
        const summary = buildFiveKSummary(
            {
                op_5k_competitor: 'Консультант, цена',
                op_5k_client: 'Нормативка',
                op_xvost_desire: 'не пятёрка — не попадает',
            },
            TITLES,
        );
        // Порядок каталожный (КЛИЕНТ раньше КОНКУРЕНТА), а не тот, в котором
        // ответы легли в объект.
        expect(summary).toBe('КЛИЕНТ: Нормативка\nКОНКУРЕНТ: Консультант, цена');
    });

    it('ни одного ответа — сводки нет, пустую строку не пишем', () => {
        expect(buildFiveKSummary({}, TITLES)).toBeNull();
        expect(buildFiveKSummary({ op_5k_client: '  ' }, TITLES)).toBeNull();
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

    it('даты нормализуются по типу вопроса', () => {
        const payload = buildPortalFieldPayload({
            answers: {
                op_manager_approach_date: '2026-08-26',
                op_presentation_xvost: '2026-08-26',
            },
            resolveKey: code => `UF_CRM_${code}`,
            typeByCode: {
                op_manager_approach_date: CheckPresentationFieldType.DATE,
                op_presentation_xvost: CheckPresentationFieldType.STRING,
            },
        });
        expect(payload).toEqual({
            UF_CRM_op_manager_approach_date: '26.08.2026',
            UF_CRM_op_presentation_xvost: '2026-08-26',
        });
    });
});

describe('toPortalValue', () => {
    it('булево — Y/N, массивы пропускаются, пустое — null', () => {
        expect(toPortalValue(false)).toBe('N');
        expect(toPortalValue(['a'])).toBeNull();
        expect(toPortalValue(' текст ')).toBe('текст');
        expect(toPortalValue('')).toBeNull();
    });

    it('дата уходит каноном портала, а не строкой браузера', () => {
        expect(
            toPortalValue('2026-08-26', CheckPresentationFieldType.DATE),
        ).toBe('26.08.2026');
        // Уже в формате портала — не ломаем.
        expect(
            toPortalValue('26.08.2026', CheckPresentationFieldType.DATE),
        ).toBe('26.08.2026');
    });

    it('неразбираемая дата не пишется сырой строкой', () => {
        expect(
            toPortalValue('на неделе', CheckPresentationFieldType.DATE),
        ).toBeNull();
    });

    it('строковый ответ форматом даты не трогается', () => {
        expect(
            toPortalValue('2026-08-26', CheckPresentationFieldType.STRING),
        ).toBe('2026-08-26');
    });
});

describe('translateSurveyCodes', () => {
    it('перевод стал тождественным: код вопроса и есть код поля', () => {
        // Раньше здесь жила таблица xo_* → op_talk_*: вопросы были заведены
        // под кодами опросника, которых нет ни в одном реестре, и ответы
        // «Разговора» не писались никуда (todo3108 №1). С переделки
        // 01.09.2026 коды у вопроса и поля общие, переводить нечего.
        expect(
            translateSurveyCodes({
                op_xvost_desire: 'встретили хорошо',
                op_5k_client: 'хочет замену',
            }),
        ).toEqual({
            op_xvost_desire: 'встретили хорошо',
            op_5k_client: 'хочет замену',
        });
    });

    it('ответы резолвятся фрейм-записью в поля реестра', () => {
        const payload = buildPortalFieldPayload({
            answers: translateSurveyCodes({ op_xvost_desire: 'слушали' }),
            resolveKey: code =>
                code === 'op_xvost_desire' ? 'UF_CRM_OP_XVOST_DESIRE' : null,
        });
        expect(payload).toEqual({ UF_CRM_OP_XVOST_DESIRE: 'слушали' });
    });
});
