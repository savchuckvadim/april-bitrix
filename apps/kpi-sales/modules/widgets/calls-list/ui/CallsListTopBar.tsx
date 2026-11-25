'use client';

import { ThemeTogglePanel } from '@workspace/theme';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';
// Прямой путь, не index фичи: нужен только ряд вкладок (без загрузки отчёта).
import { ReportType } from '@/modules/feature/report-widget-type/ui/ReportType';

const T = CALLS_LIST_TEXT;

/**
 * Верх страницы: первая строка — тот же ряд вкладок, что в отчёте («Разборы
 * звонков» среди них активна, остальные ведут в отчёт на свою вкладку), справа
 * переключатель темы, как на остальных страницах без шапки отчёта; вторая —
 * заголовок раздела и число разборов.
 */
export const CallsListTopBar = ({ total }: { total: number | null }) => (
    <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <ReportType page="calls" />
            <ThemeTogglePanel />
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-lg font-semibold">{T.title}</h1>
            {total !== null && (
                <span className="text-sm text-muted-foreground tabular-nums">
                    {total.toLocaleString('ru-RU')}
                </span>
            )}
        </div>
    </div>
);
