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
    op_xvost_desire: 'встретили хорошо',
    op_xvost_decision_way: ' готов ',
    op_5k_client: 'нормативка',
    op_5k_competitor: 'сравнивают с консультантом',
    op_presentation_xvost: 'дожать цену',
    // Не текстовый ответ контракта: дата живёт своей фичей (XvostFields) и в
    // блок опросника не входит.
    op_xvost_decision_call_date: '2026-09-10',
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
        // С 01.09.2026 код вопроса и есть код поля реестра — переводить
        // нечего, но граница перевода осталась: через неё пойдут коды
        // портального каталога анкет.
        const survey = buildCheckPresentationSurvey(ANSWERS, 'сводка «5К»');

        expect(survey).toEqual({
            talk: {
                op_xvost_desire: 'встретили хорошо',
                op_xvost_decision_way: 'готов',
            },
            fiveK: {
                op_5k_client: 'нормативка',
                op_5k_competitor: 'сравнивают с консультантом',
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
                op_xvost_desire: '   ',
                op_5k_client: '',
                op_5k_competitor: 'сравнивают с консультантом',
                op_presentation_xvost: ' ',
            },
            null,
        );

        expect(survey).toEqual({
            fiveK: { op_5k_competitor: 'сравнивают с консультантом' },
        });
    });

    it('ни одного ответа — блока нет вовсе, а не пустой объект', () => {
        expect(buildCheckPresentationSurvey({}, null)).toBeUndefined();
        expect(
            buildCheckPresentationSurvey(
                { op_xvost_decision_call_date: '2026-09-10', op_5k_client: '' },
                null,
            ),
        ).toBeUndefined();
    });
});

describe('selectCheckPresentationSurvey', () => {
    it('подтверждённые ответы + сводка «Пять К» из них же', () => {
        const survey = selectCheckPresentationSurvey(makeState());

        expect(survey?.talk).toEqual({
            op_xvost_desire: 'встретили хорошо',
            op_xvost_decision_way: 'готов',
        });
        expect(survey?.xvost).toBe('дожать цену');
        expect(survey?.fiveKSummary).toBe(
            'КЛИЕНТ: нормативка\nКОНКУРЕНТ: сравнивают с консультантом',
        );
    });

    it('сводка не теряет «К», уже записанные на лид', () => {
        // Частичное повторное заполнение: ответили на один блок из пяти —
        // сводка обязана сохранить прошлые, иначе она разъедется с полями
        // op_5k_*.
        const survey = selectCheckPresentationSurvey(
            makeState({
                committed: { op_5k_competitor: 'сравнивают с консультантом' },
                lead: { UF_CRM_OP_5K_CLIENT: 'нормативка' },
                leadFields: [
                    {
                        code: 'op_5k_client',
                        bitrixId: 'OP_5K_CLIENT',
                    },
                ],
            }),
        );

        expect(survey?.fiveKSummary).toBe(
            'КЛИЕНТ: нормативка\nКОНКУРЕНТ: сравнивают с консультантом',
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
