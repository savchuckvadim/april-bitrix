import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { PresentationProp } from '@/modules/entities/EventPresentation/model/PresSlice';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { checkPresentationData } from '../data/check-presentation';
import type { CheckPresentationValue } from '../type/check-presentation-type';
import {
    buildCheckPresentationSurvey,
    selectCheckPresentationSurvey,
} from './check-presentation.survey';

/**
 * Ответы опросника в payload отчёта: коды реестра, никакой пустоты и
 * «не заполняли — блока нет вовсе».
 */

const ANSWERS: Record<string, CheckPresentationValue> = {
    xo_impression: 'встретили хорошо',
    xo_readiness_to_approach_manager: ' готов ',
    op_5k_client_what: 'нормативка',
    op_5k_concurent: 'сравнивают с консультантом',
    op_presentation_xvost: 'дожать цену',
    // Не текстовые ответы контракта: их пишет только фрейм-запись.
    op_xvost_is_offer: true,
    op_manager_approach_date: '2026-09-10',
};

/** Состояние с подтверждённым опросником применимого события. */
const makeState = (over?: {
    committed?: Record<string, CheckPresentationValue>;
    presentationDone?: boolean;
    lead?: Record<string, unknown> | null;
    leadFields?: Array<{ code: string; bitrixId: string }>;
}): RootState =>
    ({
        app: {
            config: { withCheckPresentation: true },
            bitrix: { lead: over?.lead ?? null },
        },
        portal: {
            portal: over?.leadFields
                ? { lead: { bitrixfields: over.leadFields } }
                : null,
        },
        afterPresentation: {
            initialized: true,
            checkPresentation: {
                items: checkPresentationData,
                committed: over?.committed ?? ANSWERS,
            },
        },
        eventPresentation: {
            [PresentationProp.IS_PRESENTATION_DONE]:
                over?.presentationDone ?? true,
            [PresentationProp.IS_UNPLANNED_PRESENTATION]: false,
        },
        eventItemMenu: { type: EventItemResultType.RESULT },
    }) as unknown as RootState;

describe('buildCheckPresentationSurvey', () => {
    it('ответы уезжают КОДАМИ РЕЕСТРА, разложенные по блокам контракта', () => {
        // xo_* опросника нет ни в одном реестре полей: перевод в op_talk_*
        // делается на этой границе, дальше коды опросника не живут.
        const survey = buildCheckPresentationSurvey(ANSWERS, 'сводка «5К»');

        expect(survey).toEqual({
            talk: {
                op_talk_impression: 'встретили хорошо',
                op_talk_boss_readiness: 'готов',
            },
            fiveK: {
                op_5k_client_what: 'нормативка',
                op_5k_concurent: 'сравнивают с консультантом',
            },
            xvost: 'дожать цену',
            fiveKSummary: 'сводка «5К»',
        });
    });

    it('пустые ответы в payload не попадают', () => {
        // Пустая строка стёрла бы поле, которое мог заполнить кто-то другой:
        // «не прислали» и «прислали пусто» — разные вещи для бэка.
        const survey = buildCheckPresentationSurvey(
            {
                xo_impression: '   ',
                op_5k_client_what: '',
                op_5k_concurent: 'сравнивают с консультантом',
                op_presentation_xvost: ' ',
            },
            null,
        );

        expect(survey).toEqual({
            fiveK: { op_5k_concurent: 'сравнивают с консультантом' },
        });
    });

    it('ни одного ответа — блока нет вовсе, а не пустой объект', () => {
        expect(buildCheckPresentationSurvey({}, null)).toBeUndefined();
        expect(
            buildCheckPresentationSurvey(
                { op_xvost_is_offer: true, op_5k_client_what: '' },
                null,
            ),
        ).toBeUndefined();
    });
});

describe('selectCheckPresentationSurvey', () => {
    it('подтверждённые ответы + сводка «Пять К» из них же', () => {
        const survey = selectCheckPresentationSurvey(makeState());

        expect(survey?.talk).toEqual({
            op_talk_impression: 'встретили хорошо',
            op_talk_boss_readiness: 'готов',
        });
        expect(survey?.xvost).toBe('дожать цену');
        expect(survey?.fiveKSummary).toBe(
            'КЛИЕНТ: Что хочет?: нормативка\n' +
                'КОНКУРЕНТ: По каким критериям нас сравнивают?: ' +
                'сравнивают с консультантом',
        );
    });

    it('сводка не теряет «К», уже записанные на лид', () => {
        // Частичное повторное заполнение: ответили на один вопрос из
        // девяти — сводка обязана сохранить прошлые, иначе она разъедется
        // с полями op_5k_*.
        const survey = selectCheckPresentationSurvey(
            makeState({
                committed: { op_5k_concurent: 'сравнивают с консультантом' },
                lead: { UF_CRM_OP_5K_CLIENT_WHAT: 'нормативка' },
                leadFields: [
                    {
                        code: 'op_5k_client_what',
                        bitrixId: 'OP_5K_CLIENT_WHAT',
                    },
                ],
            }),
        );

        expect(survey?.fiveKSummary).toBe(
            'КЛИЕНТ: Что хочет?: нормативка\n' +
                'КОНКУРЕНТ: По каким критериям нас сравнивают?: ' +
                'сравнивают с консультантом',
        );
    });

    it('опросник не заполняли — блока нет', () => {
        expect(
            selectCheckPresentationSurvey(makeState({ committed: {} })),
        ).toBeUndefined();
    });

    it('опросник неприменим к событию — ответы в чужой отчёт не подмешиваются', () => {
        expect(
            selectCheckPresentationSurvey(
                makeState({ presentationDone: false }),
            ),
        ).toBeUndefined();
    });
});
