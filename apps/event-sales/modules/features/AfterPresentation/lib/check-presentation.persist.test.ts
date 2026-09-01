import { describe, expect, it } from 'vitest';
import {
    buildFiveKSummary,
    buildPortalFieldPayload,
    toPortalValue,
    translateSurveyCodes,
} from './check-presentation.persist';
import { CheckPresentationFieldType } from '../type/check-presentation-type';

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
    it('xo_* опросника → op_talk_* реестра, остальные ключи как были', () => {
        expect(
            translateSurveyCodes({
                xo_impression: 'встретили хорошо',
                xo_readiness_to_approach_manager: 'готов',
                op_5k_client_what: 'хочет замену',
                op_xvost_is_offer: true,
            }),
        ).toEqual({
            op_talk_impression: 'встретили хорошо',
            op_talk_boss_readiness: 'готов',
            op_5k_client_what: 'хочет замену',
            op_xvost_is_offer: true,
        });
    });

    it('переведённые ответы резолвятся фрейм-записью в op_talk_* поля', () => {
        // До перевода коды опросника не находились ни в одном слепке —
        // ответы «Разговора» не писались никуда (todo3108 №1).
        const payload = buildPortalFieldPayload({
            answers: translateSurveyCodes({ xo_impression: 'слушали' }),
            resolveKey: code =>
                code === 'op_talk_impression'
                    ? 'UF_CRM_OP_TALK_IMPRESSION'
                    : null,
        });
        expect(payload).toEqual({ UF_CRM_OP_TALK_IMPRESSION: 'слушали' });
    });
});
