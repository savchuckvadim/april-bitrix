'use client';

import type { ReactNode } from 'react';
import { PageHeader, type PageHeaderProps } from './PageHeader';

interface PageFrameProps extends PageHeaderProps {
    /** Ряд вкладок под шапкой — на том же месте, что в отчёте. */
    tabs?: ReactNode;
    children: ReactNode;
}

/**
 * Каркас страницы приложения без обвязки отчёта («Разборы звонков»,
 * «Настройки отчёта»): облегчённая шапка, под ней ряд вкладок и содержимое.
 * Отступы те же, что у страниц отчёта (ReportProvider и Report), поэтому при
 * переходе между вкладками шапка и ряд вкладок остаются на месте.
 */
export const PageFrame = ({ tabs, children, ...header }: PageFrameProps) => (
    <div>
        <PageHeader {...header} />
        <div className="px-7 pb-7">
            {tabs !== undefined && (
                <div className="mt-6 mb-4 flex min-h-10 w-full items-center justify-between rounded-md p-0">
                    {tabs}
                </div>
            )}
            {children}
        </div>
    </div>
);
