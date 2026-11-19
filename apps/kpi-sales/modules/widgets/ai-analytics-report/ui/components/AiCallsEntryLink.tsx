'use client';

import Link from 'next/link';
import { ListChecks } from 'lucide-react';
import { CALLS_LIST_PATH } from '@/modules/entities/calls-list/lib/calls-list.const';
import { AI_CALLS_ENTRY } from '../../lib/ai-tabs';

/**
 * «Разборы звонков» рядом с подвкладками: переход на отдельную страницу
 * внутри приложения (клиентский переход — сессия портала и стор остаются).
 */
export const AiCallsEntryLink = () => (
    <Link
        href={CALLS_LIST_PATH}
        title={AI_CALLS_ENTRY.hint}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-muted hover:underline"
    >
        <ListChecks aria-hidden className="size-3.5" />
        {AI_CALLS_ENTRY.label} →
    </Link>
);
