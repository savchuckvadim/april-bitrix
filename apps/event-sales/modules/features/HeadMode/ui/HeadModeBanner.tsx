'use client';

import { FC } from 'react';
import { UserRoundCheck } from 'lucide-react';
import { useHeadMode } from '../lib/hooks/use-head-mode';
import { HEAD_MODE_TEXT } from '../lib/head-mode-texts';

/**
 * Полоса «работаете за сотрудника». Появляется, когда открыто дело
 * сотрудника либо следующее дело записано на него: руководитель должен
 * видеть, на чьё имя уйдёт отчёт, ДО отправки.
 */
export const HeadModeBanner: FC = () => {
    const { employeeName } = useHeadMode();

    if (!employeeName) return null;

    return (
        <div
            role="status"
            className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/15 px-3 py-1.5 text-xs"
        >
            <UserRoundCheck
                aria-hidden
                className="size-3.5 shrink-0 text-warning"
            />
            <span className="min-w-0">
                {HEAD_MODE_TEXT.bannerPrefix}{' '}
                <span className="font-medium">{employeeName}</span>.{' '}
                <span className="text-muted-foreground">
                    {HEAD_MODE_TEXT.bannerNote}
                </span>
            </span>
        </div>
    );
};
