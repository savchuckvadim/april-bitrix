'use client';

import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { OFFER_LETTER_EDITOR_TEXT as TEXT } from '../../consts/offer-letter-markup.consts';
import { offerLetterLengthLabel } from '../../lib/offer-letter-view';
import { OfferLetterPreview } from '../offer-letter-preview/OfferLetterPreview';
import { OfferLetterToolbar } from '../offer-letter-toolbar/OfferLetterToolbar';
import { useOfferLetterEditor } from './hooks/use-offer-letter-editor';

interface OfferLetterEditorProps {
    id: string;
    /** Текст письма с тегами `<color>`, `<bold>`, `<red>` */
    value: string;
    onChange: (text: string) => void;
    maxLength: number;
    error?: string;
}

/**
 * Редактор письма: поле с панелью «жирный / акцент / красный» и живое превью.
 * Выделенный фрагмент оборачивается тегами, в базу уходит текст с тегами.
 */
export function OfferLetterEditor({
    id,
    value,
    onChange,
    maxLength,
    error,
}: OfferLetterEditorProps) {
    const editor = useOfferLetterEditor(value, onChange);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor={id}>{TEXT.label}</Label>
                <OfferLetterToolbar
                    canFormat={editor.canFormat}
                    activeTag={editor.activeTag}
                    onApply={editor.applyTag}
                    onClear={editor.clearTag}
                />
                <Textarea
                    id={id}
                    ref={editor.textareaRef}
                    value={value}
                    placeholder={TEXT.placeholder}
                    aria-invalid={Boolean(error)}
                    className="min-h-56 font-mono text-sm"
                    onChange={editor.handleChange}
                    onSelect={editor.handleSelect}
                    onKeyDown={editor.handleKeyDown}
                />
                <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                    <span>{editor.canFormat ? TEXT.markupHint : TEXT.selectionHint}</span>
                    <span className="shrink-0">
                        {offerLetterLengthLabel(value.length, maxLength)}
                    </span>
                </div>
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>

            <OfferLetterPreview text={value} />
        </div>
    );
}
