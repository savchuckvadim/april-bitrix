'use client';

import { SectionCard } from '@workspace/april-ui';
import type { AiAboutEndpoint } from '@/modules/entities/ai-analytics';
import { AI_ABOUT_ENDPOINT_LABELS } from '../../lib/ai-about.util';
import { AI_HOW_WE_COUNT_LIST_TEXT } from '../../lib/ai-settings-sections.texts';
import { AiHowWeCountButton } from './AiHowWeCountButton';

/** Разделы витрины в порядке подвкладок: сводка, качество, сотрудник. */
export const AI_ABOUT_ENDPOINTS: readonly AiAboutEndpoint[] = [
    'overview',
    'brief',
    'plan/daily',
    'plan-fact',
    'forecast',
    'manager/style',
    'dossier',
];

/**
 * «Как считаем» по каждому разделу витрины списком: подпись раздела и
 * иконка, открывающая диалог блока about (запрос — при открытии).
 */
export const AiHowWeCountList = () => (
    <SectionCard
        surface="glass"
        title={AI_HOW_WE_COUNT_LIST_TEXT.title}
        description={AI_HOW_WE_COUNT_LIST_TEXT.description}
    >
        <ul className="divide-y divide-border/60 text-sm">
            {AI_ABOUT_ENDPOINTS.map(endpoint => (
                <li
                    key={endpoint}
                    className="flex items-center justify-between gap-3 py-2"
                >
                    <span>{AI_ABOUT_ENDPOINT_LABELS[endpoint]}</span>
                    <AiHowWeCountButton endpoint={endpoint} />
                </li>
            ))}
        </ul>
    </SectionCard>
);
