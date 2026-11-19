'use client';

import Link from 'next/link';
import { ThemeTogglePanel } from '@workspace/theme';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';
// Прямой путь, не index виджета: index тянет всю вкладку AI (её код грузится
// лениво в отчёте), а здесь нужна одна ссылка.
import { aiTabHref } from '@/modules/widgets/ai-analytics-report/lib/ai-tabs';

const T = CALLS_LIST_TEXT;

/**
 * Одна строка вверху: «← AI-аналитика» (назад в отчёт на вкладку AI,
 * клиентский переход — сессия и стор остаются) · «Разборы звонков»; справа —
 * переключатель темы, как на остальных страницах без шапки отчёта.
 */
export const CallsListTopBar = ({ total }: { total: number | null }) => (
    <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
            <Link
                href={aiTabHref('summary')}
                title={T.backTitle}
                className="text-sm text-primary hover:underline"
            >
                {T.back}
            </Link>
            <span aria-hidden className="text-muted-foreground">
                ·
            </span>
            <h1 className="text-lg font-semibold">{T.title}</h1>
            {total !== null && (
                <span className="text-sm text-muted-foreground tabular-nums">
                    {total.toLocaleString('ru-RU')}
                </span>
            )}
        </div>
        <ThemeTogglePanel />
    </div>
);
