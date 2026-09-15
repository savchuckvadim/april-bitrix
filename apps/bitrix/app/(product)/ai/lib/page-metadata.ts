import type { Metadata } from 'next';
import type { TheoryPageContent } from '../../process/_core/theory-types';
import { AI_META_TITLE_PREFIX } from '../constants/copy';

/** `metadata` страницы раздела AI из её контента: «AI для ОП — Заголовок». */
export const aiPageMetadata = (page: TheoryPageContent): Metadata => ({
    title: `${AI_META_TITLE_PREFIX} — ${page.title}`,
    description: page.description,
});
