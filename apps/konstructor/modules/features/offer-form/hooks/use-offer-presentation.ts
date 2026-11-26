'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    PRESENTATION_REQUIRED_BLOCKER,
    isPresentationAnswered,
    isPresentationQuestionVisible,
    offerDocumentActions,
    presentationLabel,
    selectOfferPresentation,
    selectedPresentation,
} from '@/modules/entities/offer-document';

/** Пункт выбора презентации: значение — номер сделки презентации. */
export interface PresentationOption {
    value: string;
    label: string;
}

/**
 * Вопрос «Документы в продолжение презентации?»: виден, только когда у сделки
 * есть презентации. «Да» с одной презентацией выбирает её сама (подпись с
 * названием); с несколькими нужен явный выбор, по умолчанию его нет, и пока он не
 * сделан, под вопросом стоит подсказка (КП в это время не формируется).
 */
export const useOfferPresentation = () => {
    const dispatch = useAppDispatch();
    const presentation = useAppSelector(selectOfferPresentation);

    const options = useMemo<PresentationOption[]>(
        () => presentation.items.map(item => ({ value: String(item.id), label: presentationLabel(item) })),
        [presentation.items],
    );
    const selected = selectedPresentation(presentation);
    const answered = isPresentationAnswered(presentation);
    const isSingle = presentation.items.length === 1;

    return {
        visible: isPresentationQuestionVisible(presentation),
        answer: answered,
        options,
        /** «Да» и одна презентация: показываем подпись с названием, выбор не нужен */
        singleLabel: answered && isSingle && selected ? presentationLabel(selected) : null,
        /** «Да» и несколько презентаций: показываем список выбора */
        isPickerVisible: answered && !isSingle,
        selectedValue: selected ? String(selected.id) : '',
        /** Подсказка, пока презентация из нескольких не выбрана */
        missingHint: answered && !selected ? PRESENTATION_REQUIRED_BLOCKER : null,
        setAnswer: (value: boolean) => dispatch(offerDocumentActions.setPresentationAnswer(value)),
        select: (value: string) => dispatch(offerDocumentActions.setPresentationDeal(Number(value) || null)),
    };
};
