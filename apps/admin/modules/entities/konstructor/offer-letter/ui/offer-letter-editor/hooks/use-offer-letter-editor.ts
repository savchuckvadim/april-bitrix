'use client';

import {
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
    type SyntheticEvent,
} from 'react';
import {
    applyLetterTag,
    selectionLetterTag,
} from '../../../lib/markup/offer-letter-markup.util';
import { OFFER_LETTER_TAG, type OfferLetterTag } from '../../../model';

interface Selection {
    start: number;
    end: number;
}

/**
 * Поле текста письма с панелью форматирования: кнопки оборачивают выделенный
 * фрагмент в теги, значение остаётся строкой с тегами, как в базе.
 */
export const useOfferLetterEditor = (value: string, onChange: (text: string) => void) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pendingSelection = useRef<Selection | null>(null);
    const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });

    // После правки текста браузер сбрасывает выделение: возвращаем его на тот же фрагмент
    useLayoutEffect(() => {
        const range = pendingSelection.current;
        if (!range) return;
        pendingSelection.current = null;
        textareaRef.current?.setSelectionRange(range.start, range.end);
    }, [value]);

    const activeTag = useMemo(
        () => selectionLetterTag(value, selection.start, selection.end),
        [value, selection],
    );

    const applyTag = (tag: OfferLetterTag | null): void => {
        const area = textareaRef.current;
        if (!area) return;
        const edit = applyLetterTag(value, area.selectionStart, area.selectionEnd, tag);
        if (edit.text === value) return;
        const next = { start: edit.selectionStart, end: edit.selectionEnd };
        pendingSelection.current = next;
        setSelection(next);
        onChange(edit.text);
    };

    const handleSelect = (event: SyntheticEvent<HTMLTextAreaElement>): void =>
        setSelection({
            start: event.currentTarget.selectionStart,
            end: event.currentTarget.selectionEnd,
        });

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void =>
        onChange(event.target.value);

    /** Ctrl+B по физической клавише: работает и в русской раскладке */
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyB') {
            event.preventDefault();
            applyTag(OFFER_LETTER_TAG.BOLD);
        }
    };

    return {
        textareaRef,
        canFormat: selection.end > selection.start,
        activeTag,
        applyTag,
        clearTag: () => applyTag(null),
        handleSelect,
        handleChange,
        handleKeyDown,
    };
};
