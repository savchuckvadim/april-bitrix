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

/**
 * Блок с подвопросами (02.09): черновик живёт в `blocks`, а значение поля
 * CRM собирается в `answers` при каждой правке — всё, что читает ответы,
 * видит одну строку. Разворот/сворачивание значение не меняет.
 */
describe('afterPresentation: блоки с подвопросами', () => {
    const BLOCK = {
        id: 'op_5k_client',
        type: 'string' as const,
        code: 'op_5k_client',
        title: 'КЛИЕНТ',
        placeholder: '',
        required: false,
        questions: ['Какие задачи решает клиент?', 'Что важно отслеживать?'],
    };

    const init = () =>
        run(
            undefined,
            afterPresentationActions.setInitialized({
                items: [BLOCK as never],
            }),
        );

    it('инициализация больше не сеет шаблон в ответы', () => {
        const state = init();

        expect(state.checkPresentation.answers).toEqual({});
        expect(state.initialized).toBe(true);
    });

    it('текст блока и ответ на подвопрос собираются в значение поля', () => {
        let state = run(
            init(),
            afterPresentationActions.setBlockText({
                id: BLOCK.id,
                text: 'Общее впечатление',
            }),
        );
        expect(state.checkPresentation.answers[BLOCK.id]).toBe(
            'Общее впечатление',
        );

        state = run(
            state,
            afterPresentationActions.setBlockSub({
                id: BLOCK.id,
                index: 1,
                text: 'Судебную практику',
            }),
        );
        expect(state.checkPresentation.answers[BLOCK.id]).toBe(
            'Общее впечатление\n2. Что важно отслеживать? — Судебную практику',
        );
        expect(state.isConfirmed).toBe(false);
    });

    it('разворот не трогает значение и подтверждение', () => {
        let state = run(
            init(),
            afterPresentationActions.setConfirmed({ status: true }),
        );
        state = run(
            state,
            afterPresentationActions.setBlockExpanded({
                id: BLOCK.id,
                expanded: true,
            }),
        );

        expect(state.checkPresentation.blocks[BLOCK.id]?.expanded).toBe(true);
        expect(state.checkPresentation.answers[BLOCK.id]).toBeUndefined();
        expect(state.isConfirmed).toBe(true);
    });

    it('«Отмена» откатывает черновик блока вместе с ответами', () => {
        let state = run(
            init(),
            afterPresentationActions.setBlockSub({
                id: BLOCK.id,
                index: 0,
                text: 'Договоры',
            }),
        );
        state = run(state, afterPresentationActions.commitAnswers());
        state = run(
            state,
            afterPresentationActions.setBlockSub({
                id: BLOCK.id,
                index: 0,
                text: 'Совсем другое',
            }),
        );

        state = run(state, afterPresentationActions.revertAnswers());

        expect(state.checkPresentation.blocks[BLOCK.id]?.sub[0]).toBe(
            'Договоры',
        );
        expect(state.checkPresentation.answers[BLOCK.id]).toBe(
            '1. Какие задачи решает клиент? — Договоры',
        );
    });
});
