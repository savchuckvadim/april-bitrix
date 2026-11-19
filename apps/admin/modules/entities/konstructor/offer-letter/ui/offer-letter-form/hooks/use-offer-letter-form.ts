'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { OFFER_LETTER_DIALOG_TEXT as TEXT } from '../../../consts/offer-letter.consts';
import { useCreateOfferLetter, useUpdateOfferLetter } from '../../../lib/hooks';
import {
    emptyOfferLetterForm,
    offerLetterToForm,
    toOfferLetterCreate,
    toOfferLetterUpdate,
    validateOfferLetterForm,
} from '../../../lib/offer-letter-form';
import type { OfferLetter, OfferLetterFormValues } from '../../../model';

interface UseOfferLetterFormOptions {
    portalId: number;
    /** Письмо для правки; null — новое письмо */
    letter: OfferLetter | null;
    onDone: () => void;
}

/**
 * Форма письма: значения, ошибки по полям (показываются после первой попытки
 * сохранить) и запись. Успех показывается по ответу бэка, не по клику.
 */
export const useOfferLetterForm = ({ portalId, letter, onDone }: UseOfferLetterFormOptions) => {
    const createLetter = useCreateOfferLetter();
    const updateLetter = useUpdateOfferLetter();
    const [values, setValues] = useState<OfferLetterFormValues>(() =>
        letter ? offerLetterToForm(letter) : emptyOfferLetterForm(),
    );
    const [showErrors, setShowErrors] = useState(false);
    const errors = useMemo(() => validateOfferLetterForm(values), [values]);

    const setField = <Key extends keyof OfferLetterFormValues>(
        key: Key,
        value: OfferLetterFormValues[Key],
    ): void => setValues(previous => ({ ...previous, [key]: value }));

    const submit = async (): Promise<void> => {
        if (Object.keys(errors).length > 0) {
            setShowErrors(true);
            return;
        }
        try {
            if (letter) {
                await updateLetter.mutateAsync({
                    id: letter.id,
                    dto: toOfferLetterUpdate(values),
                });
            } else {
                await createLetter.mutateAsync(toOfferLetterCreate(portalId, values));
            }
            toast.success(letter ? TEXT.savedToast : TEXT.createdToast);
            onDone();
        } catch (error) {
            toast.error(getApiErrorMessage(error, TEXT.saveError));
        }
    };

    const isEdit = letter !== null;
    const isSubmitting = createLetter.isPending || updateLetter.isPending;
    const idleLabel = isEdit ? TEXT.save : TEXT.create;
    const busyLabel = isEdit ? TEXT.saving : TEXT.creating;

    return {
        values,
        setField,
        errors: showErrors ? errors : {},
        isEdit,
        wasDefault: letter?.isDefault ?? false,
        isSubmitting,
        submitLabel: isSubmitting ? busyLabel : idleLabel,
        submit,
    };
};
