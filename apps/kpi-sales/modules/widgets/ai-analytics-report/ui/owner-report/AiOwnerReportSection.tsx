'use client';

import type { ReactNode } from 'react';
import { ToneBadge } from '@workspace/april-ui';
import { AI_OWNER_REPORT_TEXT } from '../../lib/ai-owner-report.texts';

interface AiOwnerReportSectionProps {
    title: string;
    children: ReactNode;
}

/** Раздел отчёта: заголовок и содержимое. */
export const AiOwnerReportSection = ({ title, children }: AiOwnerReportSectionProps) => (
    <section className="space-y-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        {children}
    </section>
);

interface AiOwnerReportSourceBadgeProps {
    source: 'template' | 'model';
}

/** Пометка «написано моделью» / «шаблон» у частей, которые пишет модель. */
export const AiOwnerReportSourceBadge = ({ source }: AiOwnerReportSourceBadgeProps) => (
    <ToneBadge tone={source === 'model' ? 'success' : 'muted'} variant="soft" size="sm">
        {AI_OWNER_REPORT_TEXT.writtenBy[source]}
    </ToneBadge>
);

/** Ячейка-подпись таблицы (единый стиль для всех таблиц отчёта). */
export const cellClass = 'px-2 py-1 align-top text-xs';
export const headClass = 'px-2 py-1 text-left text-[11px] font-medium text-muted-foreground';
