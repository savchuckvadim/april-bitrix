'use client';

import { FC } from 'react';
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
import { ReportPultCollapsed } from './ReportPultCollapsed';
import { ReportToolsRail } from './ReportToolsRail';

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
            <ReportPultCollapsed
                workStatusName={pult.workStatusName}
                withPresentationChip={pult.withPresentationChip}
                expand={pult.expand}
            />
        );
    }

    return (
        <div
            className={cn(
                'relative rounded-lg border border-l-[3px] border-border bg-card p-2.5',
                pult.isFail
                    ? 'border-l-destructive'
                    : 'border-l-[var(--event-current)]',
            )}
        >
            <ReportToolsRail />

            <div className="mb-2 flex items-center gap-2 pr-8">
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
