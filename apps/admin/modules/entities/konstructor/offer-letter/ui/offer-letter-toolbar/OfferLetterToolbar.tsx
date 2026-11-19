'use client';

import { Button } from '@workspace/ui/components/button';
import {
    OFFER_LETTER_CLEAR_ACTION,
    OFFER_LETTER_EDITOR_TEXT,
    OFFER_LETTER_TOOLBAR,
} from '../../consts/offer-letter-markup.consts';
import type { OfferLetterTag } from '../../model';

interface OfferLetterToolbarProps {
    /** Есть выделенный фрагмент: без него кнопки не работают */
    canFormat: boolean;
    /** Стиль выделенного фрагмента, если он один на весь фрагмент */
    activeTag: OfferLetterTag | null;
    onApply: (tag: OfferLetterTag) => void;
    onClear: () => void;
}

/**
 * Панель форматирования. Нажатие не забирает фокус у поля текста
 * (`onMouseDown` с `preventDefault`), иначе выделение пропало бы раньше клика.
 */
export function OfferLetterToolbar({
    canFormat,
    activeTag,
    onApply,
    onClear,
}: OfferLetterToolbarProps) {
    const ClearIcon = OFFER_LETTER_CLEAR_ACTION.icon;

    return (
        <div
            className="flex flex-wrap gap-1.5"
            role="toolbar"
            aria-label={OFFER_LETTER_EDITOR_TEXT.toolbar}
        >
            {OFFER_LETTER_TOOLBAR.map(({ tag, label, title, icon: Icon }) => (
                <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={activeTag === tag ? 'secondary' : 'outline'}
                    disabled={!canFormat}
                    title={title}
                    aria-pressed={activeTag === tag}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => onApply(tag)}
                >
                    <Icon />
                    {label}
                </Button>
            ))}
            <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!canFormat}
                title={OFFER_LETTER_CLEAR_ACTION.title}
                onMouseDown={event => event.preventDefault()}
                onClick={onClear}
            >
                <ClearIcon />
                {OFFER_LETTER_CLEAR_ACTION.label}
            </Button>
        </div>
    );
}
