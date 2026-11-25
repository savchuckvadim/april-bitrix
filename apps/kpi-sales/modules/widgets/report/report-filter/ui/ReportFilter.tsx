'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { DatesFilter } from '@/modules/entities/report';
import { ActionsFilter } from '@/modules/entities/report';
import { useReportFilterDraft } from '@/modules/feature/report-flow';
// Поставщик выбора сотрудников — прямой путь: он лёгкий и должен стоять в
// основном чанке выше лениво грузимого дерева отделов (барель потянул бы
// дерево целиком в основной чанк).
import { DepartmentSelectionProvider } from '@/modules/feature/report-filter/ui/DepartmentSelectionProvider';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { useIsUserReport } from '../../lib/use-is-user-report';

// Дерево отделов тяжёлое — грузим лениво при первом открытии фильтров.
const CompactDepartmentFilter = dynamic(
    () =>
        import('@/modules/feature/report-filter').then(
            m => m.CompactDepartmentFilter,
        ),
    {
        ssr: false,
        loading: () => (
            <div className="h-40 animate-pulse rounded-md bg-muted" />
        ),
    },
);

interface ReportFilterProps {
    isOpen: boolean;
}

/**
 * Панель фильтров отчёта: даты + отделы + действия (последние — только на
 * вкладках, где они работают); на странице сотрудника — только даты.
 *
 * Панель правит ЧЕРНОВИК фильтра, а не действующий: данные отчёта меняются
 * только по «Применить» (в шапке), закрытие панели без «Применить»
 * черновик выбрасывает. Выбор сотрудников приходит в дерево отделов через
 * поставщика — и в компактный фильтр, и в диалог настройки (диалог
 * рисуется порталом, но остаётся в дереве React под поставщиком).
 *
 * Рендерится ВНУТРИ sticky-хедера (ReportProvider), прямо под строкой кнопок:
 * открытая, она видна при любой прокрутке страницы. Высоту ограничивает
 * хедер (колонка не выше окна), панель берёт остаток и прокручивается сама;
 * фон непрозрачный — контент страницы сквозь неё не просвечивает. Поповеры
 * внутри (календарь периода) и диалог дерева отделов рисуются порталом в
 * body, поэтому прокрутка панели их не обрезает.
 */
export const ReportFilter = ({ isOpen }: ReportFilterProps) => {
    const isUserReport = useIsUserReport();
    const draft = useReportFilterDraft();

    if (!isOpen) return null;

    const showActions =
        !isUserReport &&
        draft.isActionsVisibleOnTab &&
        draft.actionItems.length > 0;

    return (
        <div
            role="region"
            aria-label="Фильтры отчёта"
            className="min-h-0 overflow-y-auto overscroll-contain bg-background px-7 pb-3"
        >
            <DepartmentSelectionProvider
                selectedIds={draft.userIds}
                onChange={draft.changeUsers}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Фильтры</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <DatesFilter
                                    date={draft.date}
                                    onDateChange={draft.changeDate}
                                    onModeChange={draft.changeDateMode}
                                />
                            </div>

                            <div className="space-y-4">
                                {!isUserReport && <CompactDepartmentFilter />}
                            </div>
                        </div>
                    </CardContent>

                    {/* Раздел только на вкладках, где выбор действий работает
                        («Все», «События», «Объединённый»). Список действий
                        приходит с событиями: пока он не загружен, выбирать не
                        из чего. Скрытый раздел черновик не меняет — действующий
                        выбор остаётся как был. */}
                    {showActions && (
                        <CardContent>
                            <ActionsFilter
                                items={draft.actionItems}
                                currentCodes={draft.actionCodes}
                                onToggle={draft.toggleAction}
                            />
                        </CardContent>
                    )}
                </Card>
            </DepartmentSelectionProvider>
        </div>
    );
};
