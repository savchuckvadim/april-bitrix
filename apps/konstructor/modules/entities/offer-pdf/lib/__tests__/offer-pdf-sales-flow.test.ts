import { describe, expect, it } from 'vitest';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';
import {
    ONE_PRESENTATION,
    TWO_PRESENTATIONS,
    withDepartment,
    withPresentation,
    type PresentationAnswer,
} from '../../../offer-document/lib/__fixtures__/presentation-state';
import { recordOf, variantItems } from '../../../offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';
import { PRESENTATION_REQUIRED_BLOCKER } from '../../../offer-document/lib/presentation-choice.util';
import { selectOfferSalesFlowFields } from '../../../offer-document/lib/select-sales-flow';
import { OFFER_PDF_DEFAULT_SETTINGS } from '../../model/types';
import {
    buildOfferPdfGenerateRequest,
    offerPdfGenerateBlocker,
    offerPdfRequestBlocker,
    withOfferPdfInvoice,
    withOfferPdfSalesFlow,
    type OfferPdfRequestOptions,
} from '../build-offer-pdf-request';
import { offerPdfRequestKey } from '../offer-pdf-request-key';

const options: OfferPdfRequestOptions = {
    templateCode: 'classic',
    palette: null,
    settings: OFFER_PDF_DEFAULT_SETTINGS,
    letter: { appeal: '', text: '' },
    documentNumber: '',
};

/** КП в PDF: тип клиента задан, один вариант в сделке; отдел и ответ о презентации задаёт тест. */
const stateOf = (department: APP_DEP, presentation?: PresentationAnswer): RootState => {
    const base = withDepartment(rootStateWithVariants([recordOf(1, 102, 'buh')], variantItems), department);
    return presentation ? withPresentation(base, presentation) : base;
};

/** Запрос формирования PDF так, как его собирает хук: превью + счёт + поля потока продаж. */
const generateRequestOf = (state: RootState) => {
    const preview = buildOfferPdfGenerateRequest(state, options)!;
    return withOfferPdfSalesFlow(withOfferPdfInvoice(preview, { ...state.offerDocument.invoice }), selectOfferSalesFlowFields(state));
};

describe('PDF-КП: превью не получает поля потока продаж', () => {
    it('в запросе превью нет salesFlow и presentation, как бы ни был отвечен вопрос', () => {
        const state = stateOf(APP_DEP.SALES, { items: ONE_PRESENTATION, answer: true });
        const request = buildOfferPdfGenerateRequest(state, options);
        expect(request).not.toBeNull();
        expect(request).not.toHaveProperty('salesFlow');
        expect(request).not.toHaveProperty('presentation');
    });

    it('ответ о презентации и её выбор ключ превью не меняют', () => {
        const keyOf = (state: RootState) => offerPdfRequestKey(buildOfferPdfGenerateRequest(state, options)!);
        const no = keyOf(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS }));
        const yesNoChoice = keyOf(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true }));
        const yesChosen = keyOf(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true, dealId: 601 }));
        const noPresentations = keyOf(stateOf(APP_DEP.SALES));
        expect(yesNoChoice).toBe(no);
        expect(yesChosen).toBe(no);
        expect(noPresentations).toBe(no);
        expect(no).not.toContain('presentation');
        expect(no).not.toContain('salesFlow');
    });

    it('отдел ключ превью не меняет', () => {
        const keyOf = (department: APP_DEP) =>
            offerPdfRequestKey(buildOfferPdfGenerateRequest(stateOf(department), options)!);
        expect(keyOf(APP_DEP.SERVICE)).toBe(keyOf(APP_DEP.SALES));
    });
});

describe('PDF-КП: запрос формирования', () => {
    it('отдел продаж: salesFlow: true', () => {
        expect(generateRequestOf(stateOf(APP_DEP.SALES)).salesFlow).toBe(true);
    });

    it('сервисный отдел: поля salesFlow нет', () => {
        expect(generateRequestOf(stateOf(APP_DEP.SERVICE))).not.toHaveProperty('salesFlow');
    });

    it('«Нет» и «Да» без выбора из нескольких: поля presentation нет', () => {
        expect(generateRequestOf(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS }))).not.toHaveProperty('presentation');
        expect(generateRequestOf(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true }))).not.toHaveProperty(
            'presentation',
        );
    });

    it('«Да» и одна презентация: presentation с её dealId', () => {
        const request = generateRequestOf(stateOf(APP_DEP.SALES, { items: ONE_PRESENTATION, answer: true }));
        expect(request.presentation).toEqual({ dealId: 601 });
    });

    it('«Да» и выбор из нескольких: presentation с dealId выбранной', () => {
        const request = generateRequestOf(stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true, dealId: 602 }));
        expect(request.presentation).toEqual({ dealId: 602 });
    });

    it('остальное в запросе то же, что у превью со счётом', () => {
        const state = stateOf(APP_DEP.SALES, { items: ONE_PRESENTATION, answer: true });
        const preview = buildOfferPdfGenerateRequest(state, options)!;
        const withInvoice = withOfferPdfInvoice(preview, { ...state.offerDocument.invoice });
        const { salesFlow, presentation, ...rest } = generateRequestOf(state);
        expect(salesFlow).toBe(true);
        expect(presentation).toEqual({ dealId: 601 });
        expect(rest).toEqual(withInvoice);
    });
});

describe('PDF-КП: блокер выбора презентации', () => {
    const noChoice = () => stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true });

    it('«Да» при нескольких презентациях без выбора блокирует формирование, превью работает', () => {
        expect(offerPdfGenerateBlocker(noChoice())).toBe(PRESENTATION_REQUIRED_BLOCKER);
        expect(offerPdfRequestBlocker(noChoice())).toBeNull();
        expect(buildOfferPdfGenerateRequest(noChoice(), options)).not.toBeNull();
    });

    it('после выбора формирование доступно', () => {
        const state = stateOf(APP_DEP.SALES, { items: TWO_PRESENTATIONS, answer: true, dealId: 601 });
        expect(offerPdfGenerateBlocker(state)).toBeNull();
    });
});
