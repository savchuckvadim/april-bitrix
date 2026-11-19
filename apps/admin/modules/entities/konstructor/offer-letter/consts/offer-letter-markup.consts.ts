import { Bold, Highlighter, Palette, RemoveFormatting, type LucideIcon } from 'lucide-react';
import { OFFER_LETTER_TAG, type OfferLetterTag } from '../model';

/**
 * Теги, которые понимают оба рендера: PDF-КП
 * (`apps/konstructor/.../shared/rich-text.ts`) и Word. Редактор выдаёт только их.
 */
export const OFFER_LETTER_TAGS: readonly OfferLetterTag[] = [
    OFFER_LETTER_TAG.COLOR,
    OFFER_LETTER_TAG.BOLD,
    OFFER_LETTER_TAG.RED,
];

/** Кнопка панели форматирования */
export interface OfferLetterToolbarAction {
    tag: OfferLetterTag;
    label: string;
    title: string;
    icon: LucideIcon;
}

export const OFFER_LETTER_TOOLBAR: readonly OfferLetterToolbarAction[] = [
    {
        tag: OFFER_LETTER_TAG.BOLD,
        label: 'Жирный',
        title: 'Жирный (Ctrl+B)',
        icon: Bold,
    },
    {
        tag: OFFER_LETTER_TAG.COLOR,
        label: 'Акцент',
        title: 'Акцентный цвет КП, жирным',
        icon: Palette,
    },
    {
        tag: OFFER_LETTER_TAG.RED,
        label: 'Красный',
        title: 'Красный, жирным',
        icon: Highlighter,
    },
];

export const OFFER_LETTER_CLEAR_ACTION = {
    label: 'Сбросить',
    title: 'Убрать выделение у фрагмента',
    icon: RemoveFormatting,
} as const;

/** Вид тега в превью: цвета темы, в КП акцент и красный берутся из стиля PDF */
export const OFFER_LETTER_TAG_CLASS: Record<OfferLetterTag, string> = {
    [OFFER_LETTER_TAG.COLOR]: 'font-bold text-primary',
    [OFFER_LETTER_TAG.BOLD]: 'font-bold text-foreground',
    [OFFER_LETTER_TAG.RED]: 'font-bold text-destructive',
};

export const OFFER_LETTER_PLAIN_CLASS = 'text-foreground';

export const OFFER_LETTER_EDITOR_TEXT = {
    label: 'Текст письма',
    toolbar: 'Форматирование письма',
    placeholder: 'Добрый день! Направляем коммерческое предложение…',
    selectionHint: 'Выделите фрагмент текста, чтобы изменить его вид.',
    markupHint:
        'Абзацы разделяются переводом строки. В базе фрагменты хранятся тегами <color>, <bold> и <red>.',
    preview: 'Как будет выглядеть',
    previewHint: 'Цвета в превью условные: в КП акцент берётся из стиля PDF.',
    previewEmpty: 'Здесь появится текст письма.',
} as const;
