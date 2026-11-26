import { describe, expect, it } from 'vitest';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';
import { buildWordPreviewRequest } from '../../../offer-template-word/lib/build-word-preview-request';
import {
    buildOfferGenerateRequest,
    buildOfferMultiGenerateRequest,
    offerBlocker,
    offerGenerateBlocker,
    offerRequestBlocker,
    offerWordGenerateBlocker,
} from '../build-offer-request';
import { PRESENTATION_REQUIRED_BLOCKER } from '../presentation-choice.util';
import { selectOfferSalesFlowFields } from '../select-sales-flow';
import { recordOf, variantItems } from '../__fixtures__/variant-records';
import {
    ONE_PRESENTATION,
    TWO_PRESENTATIONS,
    withDepartment,
    withPresentation,
    type PresentationAnswer,
} from '../__fixtures__/presentation-state';
import { rootStateWithVariantsAndTemplate } from '../__fixtures__/variants-state';

/** КП в Word: выбранный шаблон, тип клиента, один вариант в сделке; отдел и ответ о презентации задаёт тест. */
const stateOf = (department: APP_DEP, presentation?: PresentationAnswer): RootState => {
    const base = withDepartment(rootStateWithVariantsAndTemplate([recordOf(1, 102, 'buh')], variantItems), department);
    return presentation ? withPresentation(base, presentation) : base;
};

describe('КП в Word: признак потока продаж', () => {
    it('у отдела продаж запрос формирования несёт salesFlow: true', () => {
        expect(buildOfferMultiGenerateRequest(stateOf(APP_DEP.SALES))?.salesFlow).toBe(true);
    });

    it('у сервисного отдела поля salesFlow нет совсем', () => {
        const request = buildOfferMultiGenerateRequest(stateOf(APP_DEP.SERVICE));
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('salesFlow');
    });
});

describe('КП в Word: презентация в запросе формирования', () => {
    it('ответ «Нет» — поля presentation нет', () => {
        const request = buildOfferMultiGenerateRequest(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS }));
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('presentation');
    });

    it('презентаций у сделки нет — поля presentation нет', () => {
        expect(buildOfferMultiGenerateRequest(stateOf(APP_DEP.SALES))).not.toHaveProperty('presentation');
    });

    it('«Да» и одна презентация — presentation с её dealId, и только с ним', () => {
        const request = buildOfferMultiGenerateRequest(stateOf(APP_DEP.SALES, { items: ONE_PRESENTATION, answer: true }));
        expect(request?.presentation).toEqual({ dealId: 601 });
        expect(Object.keys(request?.presentation ?? {})).toEqual(['dealId']);
    });

    it('«Да» и несколько презентаций с выбором — dealId выбранной', () => {
        const request = buildOfferMultiGenerateRequest(
            stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true, dealId: 601 }),
        );
        expect(request?.presentation).toEqual({ dealId: 601 });
    });

    it('«Да» и несколько презентаций без выбора — объект presentation не отправляется', () => {
        const request = buildOfferMultiGenerateRequest(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true }));
        expect(request).not.toHaveProperty('presentation');
    });

    it('presentation и salesFlow независимы: сервис с выбранной презентацией несёт только presentation', () => {
        const request = buildOfferMultiGenerateRequest(
            stateOf(APP_DEP.SERVICE, { items: ONE_PRESENTATION, answer: true }),
        );
        expect(request?.presentation).toEqual({ dealId: 601 });
        expect(request).not.toHaveProperty('salesFlow');
    });
});

describe('КП: блокер выбора презентации', () => {
    const noChoice = () => stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true });

    it('«Да» и несколько презентаций без выбора блокируют формирование Word и PDF', () => {
        expect(offerWordGenerateBlocker(noChoice())).toBe(PRESENTATION_REQUIRED_BLOCKER);
        expect(offerGenerateBlocker(noChoice(), 'word')).toBe(PRESENTATION_REQUIRED_BLOCKER);
        expect(offerGenerateBlocker(noChoice(), 'pdf')).toBe(PRESENTATION_REQUIRED_BLOCKER);
    });

    it('превью выбор презентации не блокирует', () => {
        expect(offerRequestBlocker(noChoice())).toBeNull();
        expect(offerBlocker(noChoice(), 'word')).toBeNull();
        expect(offerBlocker(noChoice(), 'pdf')).toBeNull();
    });

    it('после выбора формирование разблокировано', () => {
        const state = stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true, dealId: 602 });
        expect(offerGenerateBlocker(state, 'word')).toBeNull();
        expect(offerGenerateBlocker(state, 'pdf')).toBeNull();
    });

    it('«Нет» и одна презентация формирование не блокируют', () => {
        expect(offerGenerateBlocker(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS }), 'word')).toBeNull();
        expect(offerGenerateBlocker(stateOf(APP_DEP.SALES, { items: ONE_PRESENTATION, answer: true }), 'pdf')).toBeNull();
    });
});

describe('превью Word не получает поля потока продаж', () => {
    const answered = () => stateOf(APP_DEP.SALES, { items: ONE_PRESENTATION, answer: true });

    it('в теле превью нет salesFlow и presentation', () => {
        const preview = buildWordPreviewRequest(answered());
        expect(preview).not.toBeNull();
        expect(preview).not.toHaveProperty('salesFlow');
        expect(preview).not.toHaveProperty('presentation');
    });

    it('одиночное тело КП тоже без них: их добавляет только запрос формирования', () => {
        const offer = buildOfferGenerateRequest(answered());
        expect(offer).not.toHaveProperty('salesFlow');
        expect(offer).not.toHaveProperty('presentation');
    });
});

describe('поля потока продаж из состояния', () => {
    it('продажи и выбранная презентация — оба поля', () => {
        const state = stateOf(APP_DEP.SALES, { items: ONE_PRESENTATION, answer: true });
        expect(selectOfferSalesFlowFields(state)).toEqual({ salesFlow: true, presentation: { dealId: 601 } });
    });

    it('сервис без презентации — пустой набор полей', () => {
        expect(selectOfferSalesFlowFields(stateOf(APP_DEP.SERVICE))).toEqual({});
    });
});
