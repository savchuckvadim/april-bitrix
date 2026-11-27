'use client';

import { Switch } from '@workspace/ui/components/switch';
import {
    LETTER_TOGGLE_ARIA_LABEL,
    LETTER_TOGGLE_OFF_LABEL,
    LETTER_TOGGLE_ON_LABEL,
} from '../../lib/offer-letter-texts';
import { useLetterToggle } from './hooks/use-letter-toggle';

/** Выключатель сопроводительного письма в шапке карточки: письма нет, и подписи под ним тоже */
export const OfferLetterToggle = () => {
    const { withLetter, setWithLetter } = useLetterToggle();
    return (
        <label
            htmlFor="offer-letter-toggle"
            className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
        >
            <Switch
                id="offer-letter-toggle"
                checked={withLetter}
                onCheckedChange={setWithLetter}
                aria-label={LETTER_TOGGLE_ARIA_LABEL}
            />
            {withLetter ? LETTER_TOGGLE_ON_LABEL : LETTER_TOGGLE_OFF_LABEL}
        </label>
    );
};
