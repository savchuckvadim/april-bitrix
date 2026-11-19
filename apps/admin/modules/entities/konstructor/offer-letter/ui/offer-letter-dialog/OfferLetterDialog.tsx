'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { OFFER_LETTER_DIALOG_TEXT as TEXT } from '../../consts/offer-letter.consts';
import type { OfferLetter } from '../../model';
import { OfferLetterForm } from '../offer-letter-form/OfferLetterForm';

interface OfferLetterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    portalId: number;
    /** Письмо для правки; null — новое письмо */
    letter: OfferLetter | null;
}

/**
 * Окно письма: создание и правка. Содержимое Radix размонтирует при закрытии,
 * поэтому форма каждый раз открывается со свежими значениями.
 */
export function OfferLetterDialog({
    open,
    onOpenChange,
    portalId,
    letter,
}: OfferLetterDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{letter ? TEXT.editTitle : TEXT.createTitle}</DialogTitle>
                    <DialogDescription>{letter?.name ?? TEXT.createDescription}</DialogDescription>
                </DialogHeader>
                <OfferLetterForm
                    portalId={portalId}
                    letter={letter}
                    onDone={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
