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
import { Input } from '@workspace/ui/components/input';
import { eventSaleActions } from '@/modules/entities/EventSale';
import { eventPostFailActions } from '@/modules/entities/EVPostFail';
import { LeadRequestNotCaSelect } from '@/modules/features/LeadRequestCard/ui/LeadRequestNotCaSelect';
import { useReportPult } from '../../lib/hooks/use-report-pult';
import { usePresentationDeals } from '../../lib/hooks/use-presentation-deals';
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
interface ReportPultProps {
    withNoresult?: boolean;
    /** Статус «Продажа»: связь с презентационной сделкой — строкой пульта. */
    withSale?: boolean;
    /** «Отказ» на withPostFail-доменах: дата следующего звонка. */
    withPostFail?: boolean;
    /** Кнопка презентации стоит в карточке комментария — чип не дублируем. */
    withPresentationButton?: boolean;
}

export const ReportPult: FC<ReportPultProps> = ({
    withNoresult = false,
    withSale = false,
    withPostFail = false,
    withPresentationButton = false,
}) => {
    const dispatch = useAppDispatch();
    const pult = useReportPult(withNoresult, withPresentationButton);
    const report = useAppSelector(s => s.eventReport.report);

    const setProp = (propName: EventReportSelectProp) => (value: string) =>
        dispatch(eventReportActions.setReportProp({ propName, value }));

    // Список презентаций подтягивается по факту выбора «Продажи».
    const presDeals = usePresentationDeals(withSale);
    const postFailDate = useAppSelector(s => s.eventPostFail.postFailDate);

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

                {/* Продажа: связь с презентационной сделкой. Раньше жила
                    отдельной карточкой ради одного селекта. */}
                {withSale &&
                    (presDeals.items.length ? (
                        <MicroField label="Сделка презентации">
                            <MicroSelect
                                ariaLabel="Сделка презентации"
                                value={
                                    presDeals.current
                                        ? String(presDeals.current.ID)
                                        : undefined
                                }
                                placeholder="Связать со сделкой"
                                options={presDeals.items.map(deal => ({
                                    value: String(deal.ID),
                                    label: deal.TITLE,
                                }))}
                                onChange={value =>
                                    dispatch(
                                        eventSaleActions.setCurrentPresItem({
                                            dealId: Number(value),
                                            type: 'current',
                                        }),
                                    )
                                }
                            />
                        </MicroField>
                    ) : (
                        <span className="text-[0.6875rem] text-muted-foreground">
                            {presDeals.isItemsFetched
                                ? 'презентаций у клиента нет'
                                : 'ищем презентации…'}
                        </span>
                    ))}

                {/* Пост-отказ: дата следующего звонка тем же кеглем. */}
                {withPostFail && (
                    <MicroField label="Следующий звонок" required>
                        <Input
                            type="date"
                            value={postFailDate}
                            onChange={e => {
                                dispatch(
                                    eventPostFailActions.setPostFailDate({
                                        date: e.target.value,
                                    }),
                                );
                                dispatch(
                                    eventPostFailActions.setIsChanged({
                                        status: true,
                                    }),
                                );
                            }}
                            className="h-6 w-34 px-2 py-0 text-[0.6875rem]"
                        />
                    </MicroField>
                )}

                {/* Заявка при отказе: тип «не ЦА» уезжает в leadSync payload'а. */}
                {pult.isFail && <LeadRequestNotCaSelect />}
            </div>
        </div>
    );
};
