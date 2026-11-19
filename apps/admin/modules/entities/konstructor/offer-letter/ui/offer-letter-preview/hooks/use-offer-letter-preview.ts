'use client';

import { useMemo } from 'react';
import { buildLetterParagraphs } from '../../../lib/markup/offer-letter-preview.util';

/** Абзацы превью пересобираются только при смене текста */
export const useOfferLetterPreview = (text: string) =>
    useMemo(() => buildLetterParagraphs(text), [text]);
