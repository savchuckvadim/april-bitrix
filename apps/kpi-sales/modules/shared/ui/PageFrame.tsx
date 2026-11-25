'use client';

import type { ReactNode } from 'react';
import { PageHeader, type PageHeaderProps } from './PageHeader';
import { PAGE_BODY_CLASS, PAGE_TABS_ROW_CLASS } from './page-layout.classes';

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
        <div className={PAGE_BODY_CLASS}>
            {tabs !== undefined && (
                <div className={PAGE_TABS_ROW_CLASS}>{tabs}</div>
            )}
            {children}
        </div>
    </div>
);
