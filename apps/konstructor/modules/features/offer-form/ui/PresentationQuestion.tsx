'use client';

import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import { useOfferPresentation } from '../hooks/use-offer-presentation';
import { PresentationPicker } from './PresentationPicker';

/**
 * «Документы в продолжение презентации?» Да/Нет в карточке «От кого и счёт».
 * Показывается, только когда у сделки есть презентации; по умолчанию «Нет».
 * «Да» с одной презентацией подписывает её название, с несколькими даёт список
 * выбора.
 */
export const PresentationQuestion = () => {
    const presentation = useOfferPresentation();
    if (!presentation.visible) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span id="offer-presentation-question" className="text-sm">
                    Документы в продолжение презентации?
                </span>
                <RadioGroup
                    aria-labelledby="offer-presentation-question"
                    value={presentation.answer ? 'yes' : 'no'}
                    onValueChange={value => presentation.setAnswer(value === 'yes')}
                    className="flex gap-4"
                >
                    <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="yes" />
                        Да
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <RadioGroupItem value="no" />
                        Нет
                    </label>
                </RadioGroup>
            </div>
            {presentation.singleLabel ? (
                <p className="text-xs text-muted-foreground">Презентация: {presentation.singleLabel}</p>
            ) : null}
            {presentation.isPickerVisible ? (
                <PresentationPicker
                    options={presentation.options}
                    value={presentation.selectedValue}
                    onChange={presentation.select}
                    hint={presentation.missingHint}
                />
            ) : null}
        </div>
    );
};
