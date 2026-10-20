'use client';

import Link from 'next/link';
import { Info } from 'lucide-react';
import { AiHowWeCountButton, AiTheoryLink, aiTabHref } from '@/modules/widgets/ai-analytics-report';
import { useAiEmployeeContext } from '../lib/ai-employee.context';
import { AI_EMPLOYEE_TEXT } from '../lib/ai-employee.texts';

const T = AI_EMPLOYEE_TEXT;

/**
 * Шапка AI-раздела: период, за который считает AI, ссылка на вкладку AI,
 * «Как считаем» и теория; режим «вижу себя» — подпись; обзор готов без
 * строки сотрудника — честная причина и что сделать.
 */
export const AiEmployeeHeader = () => {
    const { period, isSelf, rowMissing } = useAiEmployeeContext();

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                    {period ? T.header.period(period.from, period.to) : T.header.periodUnknown}
                </span>
                <span className="flex items-center gap-2">
                    <AiHowWeCountButton endpoint="dossier" />
                    <AiTheoryLink topic="dossier" variant="icon" />
                    <Link href={aiTabHref('summary')} className="text-primary hover:underline">
                        {T.header.openTab}
                    </Link>
                </span>
            </div>
            {isSelf && <p className="text-xs text-muted-foreground">{T.header.selfView}</p>}
            {rowMissing && (
                <div className="flex gap-2 rounded-md border border-dashed border-border/60 p-3 text-xs">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="font-medium">{T.rowMissing.title}</p>
                        <p className="text-muted-foreground">{T.rowMissing.text}</p>
                        <p>{T.rowMissing.action}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
