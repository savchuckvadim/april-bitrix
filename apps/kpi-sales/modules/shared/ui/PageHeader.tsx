'use client';

import type { ReactNode } from 'react';
import { ThemeTogglePanel } from '@workspace/theme';

export interface PageHeaderProps {
    /** Название страницы. */
    title: string;
    /** Приписка к названию мелким шрифтом — например, число записей. */
    note?: ReactNode;
    /** Кнопка «назад»: стоит между переключателем вида и названием. */
    back?: ReactNode;
    /** Кнопки справа — иконки с подсказкой (HeaderAction). */
    actions?: ReactNode;
}

/**
 * Облегчённая шапка страницы приложения: тот же вид и то же место, что у шапки
 * отчёта (widgets/report — ReportProvider и ReportHeader), но без его обвязки.
 * Слева переключатель вида, «назад» и название, справа кнопки-иконки; шапка
 * прилипает к верху окна, как в отчёте.
 *
 * Периода, фильтров, выгрузки и публичных ссылок здесь нет: они относятся
 * только к отчёту, а эти страницы его расчёта не ждут.
 */
export const PageHeader = ({ title, note, back, actions }: PageHeaderProps) => (
    <header className="sticky top-0 z-10 bg-background/50 backdrop-blur-sm">
        <div className="px-7 py-2">
            <div className="flex h-12 w-full items-center justify-between gap-2">
                <div className="flex min-w-0 flex-row items-center">
                    <ThemeTogglePanel align="start" />
                    {back}
                    <h1 className="ml-2 truncate font-bold">
                        {title}
                        {note !== undefined && note !== null && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
                                {note}
                            </span>
                        )}
                    </h1>
                </div>
                {actions !== undefined && (
                    <div className="flex shrink-0 flex-row items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    </header>
);
