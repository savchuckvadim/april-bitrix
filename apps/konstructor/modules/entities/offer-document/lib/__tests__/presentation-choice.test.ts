import { describe, expect, it } from 'vitest';
import { INITIAL_PRESENTATION, type OfferPresentationState } from '../../model/types';
import {
    PRESENTATION_REQUIRED_BLOCKER,
    isPresentationQuestionVisible,
    presentationBlocker,
    presentationRequestFields,
    presentationSummary,
    selectedPresentation,
} from '../presentation-choice.util';
import { ONE_PRESENTATION, TWO_PRESENTATIONS } from '../__fixtures__/presentation-state';

const stateOf = (patch: Partial<OfferPresentationState>): OfferPresentationState => ({
    ...INITIAL_PRESENTATION,
    status: 'ready',
    ...patch,
});

describe('видимость вопроса о презентации', () => {
    it('презентаций нет — вопрос скрыт', () => {
        expect(isPresentationQuestionVisible(stateOf({ items: [] }))).toBe(false);
    });

    it('не загружено — вопрос скрыт', () => {
        expect(isPresentationQuestionVisible(INITIAL_PRESENTATION)).toBe(false);
    });

    it('есть хоть одна презентация — вопрос виден', () => {
        expect(isPresentationQuestionVisible(stateOf({ items: ONE_PRESENTATION }))).toBe(true);
        expect(isPresentationQuestionVisible(stateOf({ items: TWO_PRESENTATIONS }))).toBe(true);
    });
});

describe('ответ «Нет» (по умолчанию)', () => {
    it('презентация не выбрана, блокера нет, в запрос ничего не идёт', () => {
        for (const items of [ONE_PRESENTATION, TWO_PRESENTATIONS]) {
            const presentation = stateOf({ items });
            expect(selectedPresentation(presentation)).toBeNull();
            expect(presentationBlocker(presentation)).toBeNull();
            expect(presentationRequestFields(presentation)).toEqual({});
            expect(presentationSummary(presentation)).toBeNull();
        }
    });

    it('выбор, сделанный до «Нет», в запрос не попадает', () => {
        const presentation = stateOf({ items: TWO_PRESENTATIONS, answer: false, dealId: 601 });
        expect(presentationRequestFields(presentation)).toEqual({});
    });
});

describe('«Да» и одна презентация', () => {
    const presentation = stateOf({ items: ONE_PRESENTATION, answer: true });

    it('единственная презентация выбрана сама, выбор не нужен', () => {
        expect(selectedPresentation(presentation)?.id).toBe(601);
        expect(presentationBlocker(presentation)).toBeNull();
    });

    it('в запрос идёт её dealId', () => {
        expect(presentationRequestFields(presentation)).toEqual({ presentation: { dealId: 601 } });
    });

    it('в сводке её название', () => {
        expect(presentationSummary(presentation)).toEqual({ title: 'Презентация «Гарант»' });
    });
});

describe('«Да» и несколько презентаций', () => {
    it('выбора по умолчанию нет: свежая презентация сама не выбирается', () => {
        const presentation = stateOf({ items: TWO_PRESENTATIONS, answer: true });
        expect(selectedPresentation(presentation)).toBeNull();
    });

    it('пока презентация не выбрана, формирование блокируется понятным текстом', () => {
        const presentation = stateOf({ items: TWO_PRESENTATIONS, answer: true });
        expect(presentationBlocker(presentation)).toBe(PRESENTATION_REQUIRED_BLOCKER);
        expect(PRESENTATION_REQUIRED_BLOCKER).toBe('Выберите презентацию, после которой отправляется КП');
    });

    it('без выбора объект presentation в запрос не уходит совсем', () => {
        const fields = presentationRequestFields(stateOf({ items: TWO_PRESENTATIONS, answer: true }));
        expect(fields).toEqual({});
        expect(fields).not.toHaveProperty('presentation');
    });

    it('в сводке «Да» без выбора помечено пустым названием', () => {
        expect(presentationSummary(stateOf({ items: TWO_PRESENTATIONS, answer: true }))).toEqual({ title: null });
    });

    it('после выбора блокера нет, в запрос идёт dealId выбранной', () => {
        const presentation = stateOf({ items: TWO_PRESENTATIONS, answer: true, dealId: 601 });
        expect(presentationBlocker(presentation)).toBeNull();
        expect(presentationRequestFields(presentation)).toEqual({ presentation: { dealId: 601 } });
        expect(presentationSummary(presentation)).toEqual({ title: 'Презентация «Бухгалтер»' });
    });

    it('выбор, которого нет в списке, выбором не считается', () => {
        const presentation = stateOf({ items: TWO_PRESENTATIONS, answer: true, dealId: 999 });
        expect(selectedPresentation(presentation)).toBeNull();
        expect(presentationBlocker(presentation)).toBe(PRESENTATION_REQUIRED_BLOCKER);
        expect(presentationRequestFields(presentation)).toEqual({});
    });
});

describe('«Да» без презентаций', () => {
    it('ответ без вопроса не действует: блокера и поля нет', () => {
        const presentation = stateOf({ items: [], answer: true });
        expect(presentationBlocker(presentation)).toBeNull();
        expect(presentationRequestFields(presentation)).toEqual({});
        expect(presentationSummary(presentation)).toBeNull();
    });
});
