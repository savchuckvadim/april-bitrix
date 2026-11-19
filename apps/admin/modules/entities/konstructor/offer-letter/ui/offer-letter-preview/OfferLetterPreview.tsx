'use client';

import { cn } from '@workspace/ui/lib/utils';
import {
    OFFER_LETTER_EDITOR_TEXT as TEXT,
    OFFER_LETTER_PLAIN_CLASS,
    OFFER_LETTER_TAG_CLASS,
} from '../../consts/offer-letter-markup.consts';
import { useOfferLetterPreview } from './hooks/use-offer-letter-preview';

interface OfferLetterPreviewProps {
    /** Текст письма с тегами */
    text: string;
    className?: string;
}

/** Письмо так, как его печатает КП: абзацы, акцент, красный и жирный цветами темы */
export function OfferLetterPreview({ text, className }: OfferLetterPreviewProps) {
    const paragraphs = useOfferLetterPreview(text);

    return (
        <div className={cn('space-y-1.5', className)}>
            <p className="text-xs font-semibold">{TEXT.preview}</p>
            <div className="min-h-32 space-y-2 rounded-md border bg-card p-3 text-sm leading-relaxed text-card-foreground">
                {paragraphs.length ? (
                    paragraphs.map((runs, paragraphIndex) => (
                        <p key={paragraphIndex}>
                            {runs.map((run, runIndex) => (
                                <span
                                    key={runIndex}
                                    className={
                                        run.tag
                                            ? OFFER_LETTER_TAG_CLASS[run.tag]
                                            : OFFER_LETTER_PLAIN_CLASS
                                    }
                                >
                                    {run.text}
                                </span>
                            ))}
                        </p>
                    ))
                ) : (
                    <p className="text-muted-foreground">{TEXT.previewEmpty}</p>
                )}
            </div>
            <p className="text-xs text-muted-foreground">{TEXT.previewHint}</p>
        </div>
    );
}
