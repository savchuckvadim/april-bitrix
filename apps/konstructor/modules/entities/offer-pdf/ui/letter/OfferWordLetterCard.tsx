'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { LETTER_CARD_TITLE, LETTER_WORD_DESCRIPTION, LETTER_WORD_NOTE } from '../../lib/offer-letter-texts';
import { OfferLetterToggle } from './OfferLetterToggle';

/** Письмо в Word-КП: переключатель «с письмом / без», текст письма живёт в шаблоне */
export const OfferWordLetterCard = () => (
    <SectionCard
        title={LETTER_CARD_TITLE}
        description={LETTER_WORD_DESCRIPTION}
        tone="complect"
        density="compact"
        actions={<OfferLetterToggle />}
    >
        <p className="text-xs text-muted-foreground">{LETTER_WORD_NOTE}</p>
    </SectionCard>
);
