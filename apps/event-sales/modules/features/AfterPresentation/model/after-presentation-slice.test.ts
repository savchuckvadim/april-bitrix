import { describe, expect, it } from 'vitest';
import {
    afterPresentationActions,
    afterPresentationReducer,
    type AfterPresentationState,
} from './AfterPresentationSlice';

/**
 * Сценарий двух писателей: опросник сохранил ответ, менеджер поверх правит
 * то же поле вручную (XvostFields). Без syncAnswer повторный submit опросника
 * персистил бы committed со СТАРЫМ значением и откатывал ручную правку.
 */
const run = (
    state: AfterPresentationState | undefined,
    action: Parameters<typeof afterPresentationReducer>[1],
) => afterPresentationReducer(state, action);

describe('afterPresentation.setAnswer гасит подтверждение', () => {
    it('правка ответа снимает isConfirmed', () => {
        let state = run(
            undefined,
            afterPresentationActions.setConfirmed({ status: true }),
        );
        expect(state.isConfirmed).toBe(true);

        state = run(
            state,
            afterPresentationActions.setAnswer({
                id: 'op_presentation_xvost',
                value: 'поправил',
            }),
        );
        // Иначе «поправил → Отмена → отправка» уводила бы старый снимок.
        expect(state.isConfirmed).toBe(false);
    });

    it('синхронизация ручной правки подтверждение НЕ гасит', () => {
        let state = run(
            undefined,
            afterPresentationActions.setConfirmed({ status: true }),
        );
        state = run(
            state,
            afterPresentationActions.syncAnswer({
                id: 'op_xvost_is_offer',
                value: true,
            }),
        );
        // syncAnswer пишет и в answers, и в committed — снимок остаётся честным.
        expect(state.isConfirmed).toBe(true);
    });
});

describe('afterPresentation.syncAnswer', () => {

    it('пишет ручную правку и в answers, и в committed', () => {
        // Опросник заполнен и подтверждён: ответ закоммичен.
        let state = run(
            undefined,
            afterPresentationActions.setAnswer({
                id: 'op_xvost_is_offer',
                value: false,
            }),
        );
        state = run(state, afterPresentationActions.commitAnswers());
        expect(state.checkPresentation.committed.op_xvost_is_offer).toBe(false);

        // Ручная правка того же поля мимо опросника.
        state = run(
            state,
            afterPresentationActions.syncAnswer({
                id: 'op_xvost_is_offer',
                value: true,
            }),
        );

        // Повторный submit (commit + персист committed) уже не откатит.
        state = run(state, afterPresentationActions.commitAnswers());
        expect(state.checkPresentation.answers.op_xvost_is_offer).toBe(true);
        expect(state.checkPresentation.committed.op_xvost_is_offer).toBe(true);
    });

    it('отмена опросника (revert) не воскрешает старое значение', () => {
        let state = run(
            undefined,
            afterPresentationActions.setAnswer({
                id: 'op_manager_approach_date',
                value: '2026-08-01',
            }),
        );
        state = run(state, afterPresentationActions.commitAnswers());
        state = run(
            state,
            afterPresentationActions.syncAnswer({
                id: 'op_manager_approach_date',
                value: '2026-08-25',
            }),
        );

        state = run(state, afterPresentationActions.revertAnswers());
        expect(
            state.checkPresentation.answers.op_manager_approach_date,
        ).toBe('2026-08-25');
    });
});
