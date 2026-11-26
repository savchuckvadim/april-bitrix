import { APP_DEP } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';
import { offerDocumentActions, offerDocumentReducer } from '../../model/OfferDocumentSlice';
import type { PresentationDeal } from '../../model/types';

/** Сделка презентации для тестов. */
export const presentationDeal = (id: number, title: string, createdAt = '2026-11-20T10:00:00+03:00'): PresentationDeal => ({
    id,
    title,
    createdAt,
    stageId: 'C12:NEW',
});

export const ONE_PRESENTATION: PresentationDeal[] = [presentationDeal(601, 'Презентация «Гарант»')];

/** Две презентации: 602 свежее 601. */
export const TWO_PRESENTATIONS: PresentationDeal[] = [
    presentationDeal(602, 'Презентация «Юрист»', '2026-11-22T09:30:00+03:00'),
    presentationDeal(601, 'Презентация «Бухгалтер»', '2026-11-20T10:00:00+03:00'),
];

export interface PresentationAnswer {
    items: PresentationDeal[];
    /** Ответ «Да» */
    answer?: boolean;
    /** Явно выбранная презентация */
    dealId?: number | null;
}

/** Состояние с загруженными презентациями и ответом менеджера. */
export const withPresentation = (state: RootState, { items, answer = false, dealId = null }: PresentationAnswer): RootState => {
    let offerDocument = offerDocumentReducer(state.offerDocument, offerDocumentActions.presentationLoaded(items));
    offerDocument = offerDocumentReducer(offerDocument, offerDocumentActions.setPresentationAnswer(answer));
    offerDocument = offerDocumentReducer(offerDocument, offerDocumentActions.setPresentationDeal(dealId));
    return { ...state, offerDocument };
};

/** Состояние с заданным отделом: продажи или сервис. */
export const withDepartment = (state: RootState, department: APP_DEP): RootState => ({
    ...state,
    app: { ...state.app, department },
});
