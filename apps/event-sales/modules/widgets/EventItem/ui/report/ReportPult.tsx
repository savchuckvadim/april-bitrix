'use client';

import { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { MicroField, MicroSelect } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    EventReportSelectProp,
    eventReportActions,
    WorkStatusSegments,
} from '@/modules/entities/EventReport';
import { LeadRequestNotCaSelect } from '@/modules/features/LeadRequestCard/ui/LeadRequestNotCaSelect';
import { useReportPult } from '../../lib/hooks/use-report-pult';
import { PresentationDoneChip } from './PresentationDoneChip';

/**
 * Пульт отчёта — ЕДИНСТВЕННОЕ место, где менеджер отмечает итог разговора.
 *
 * Раньше отметки жили россыпью: крупная кнопка статуса в своей карточке,
 * причина недозвона — в другой, отказные селекты — в третьей, и всё разного
 * кегля. Рядом с плотной колонкой плана это читалось как беспорядок, а в
 * обычном случае («в работе», менять нечего) целая карточка занимала экран
 * ради одной кнопки.
 *
 * Теперь: одна строка одного размера, ситуативные селекты просто удлиняют
 * её, а когда отмечать нечего — карточка сворачивается в светящуюся пилюлю
 * (см. ReportPultCollapsed) и вертикаль достаётся комментарию.
 */
export const ReportPult: FC<{ withNoresult?: boolean }> = ({
    withNoresult = false,
}) => {
    const dispatch = useAppDispatch();
    const pult = useReportPult(withNoresult);
    const report = useAppSelector(s => s.eventReport.report);

    const setProp = (propName: EventReportSelectProp) => (value: string) =>
        dispatch(eventReportActions.setReportProp({ propName, value }));

    const noresultReason = report[EV_REPORT_PROP.NORESULT_REASON];
    const failType = report[EV_REPORT_PROP.FAIL_TYPE];
    const failReason = report[EV_REPORT_PROP.FAIL_REASON];

    if (pult.isCollapsed) {
        return (
            <button
                type="button"
                onClick={pult.expand}
                className="group flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[color:color-mix(in_oklab,var(--success),var(--border)_60%)] bg-[color:color-mix(in_oklab,var(--success),var(--card)_94%)] px-2.5 py-1.5 text-left"
            >
                <span className="relative flex size-2 shrink-0">
                    {/* Пульсация — «работа идёт», а не «нужно действие». */}
                    <span className="absolute inset-0 animate-echo-ring rounded-full motion-reduce:animate-none" />
                    <span className="size-2 rounded-full bg-success" />
                </span>
                <span className="text-xs font-semibold text-[color:color-mix(in_oklab,var(--success),var(--foreground)_var(--tone-soft-mix))]">
                    {pult.workStatusName}
                </span>
                {pult.isPresentationDone && (
                    <span className="rounded-full bg-event-pres/20 px-1.5 py-px text-[0.625rem] font-medium text-event-pres-foreground">
                        презентация проведена
                    </span>
                )}
                <span className="ml-auto inline-flex items-center gap-0.5 text-[0.65rem] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    развернуть
                    <ChevronDown aria-hidden className="size-3" />
                </span>
            </button>
        );
    }

    return (
        <div
            className={cn(
                'rounded-lg border border-l-[3px] border-border bg-card p-2.5',
                pult.isFail
                    ? 'border-l-destructive'
                    : 'border-l-[var(--event-current)]',
            )}
        >
            <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold">Отчёт</span>
                {pult.hasRequired && (
                    <span className="text-[0.65rem] font-semibold text-destructive">
                        • обязательно заполнить
                    </span>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <MicroField label="Статус">
                    <WorkStatusSegments />
                </MicroField>

                {pult.withPresentationChip && <PresentationDoneChip />}

                {pult.withNoresult && (
                    <MicroField label="Причина" required>
                        <MicroSelect
                            ariaLabel="Причина недозвона"
                            value={String(noresultReason.current.id)}
                            options={noresultReason.items.map(item => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                            onChange={setProp(EV_REPORT_PROP.NORESULT_REASON)}
                        />
                    </MicroField>
                )}

                {failType.isActive && (
                    <MicroField label="Тип отказа" required>
                        <MicroSelect
                            ariaLabel="Тип отказа"
                            value={String(failType.current.id)}
                            options={failType.items.map(item => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                            onChange={setProp(EV_REPORT_PROP.FAIL_TYPE)}
                        />
                    </MicroField>
                )}

                {failReason.isActive && (
                    <MicroField label="Причина отказа" required>
                        <MicroSelect
                            ariaLabel="Причина отказа"
                            value={String(failReason.current.id)}
                            options={failReason.items.map(item => ({
                                value: String(item.id),
                                label: item.name,
                            }))}
                            onChange={setProp(EV_REPORT_PROP.FAIL_REASON)}
                        />
                    </MicroField>
                )}

                {/* Заявка при отказе: тип «не ЦА» уезжает в leadSync payload'а. */}
                {pult.isFail && <LeadRequestNotCaSelect />}
            </div>
        </div>
    );
};
