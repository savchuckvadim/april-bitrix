'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    EventReportSelectProp,
    eventReportActions,
    WorkStatusSegments,
} from '@/modules/entities/EventReport';

/**
 * Итог разговора: статус работы и — только при «Отказе» — его тип и причина.
 *
 * Секция намеренно ужата до одной строки в обычном случае. Раньше здесь жили
 * ещё прогноз и статус клиента, и карточка выглядела анкетой из трёх крупных
 * полей. Но прогноз и статус описывают КЛИЕНТА, а не состоявшийся разговор —
 * они переехали в полоску клиента в шапке (`ClientBar`). Освободившаяся высота
 * достаётся комментарию: его пишут на каждом отчёте, а статусы выбирают одним
 * тапом.
 *
 * Уточнения отказа — вложенным блоком, а не равноправными ячейками грида: так
 * видно, что это продолжение выбранного «Отказа», и в остальных случаях
 * карточка не раздувается.
 */
export const ReportSection: FC = () => {
    const dispatch = useAppDispatch();
    const report = useAppSelector(s => s.eventReport.report);

    const failType = report[EV_REPORT_PROP.FAIL_TYPE];
    const failReason = report[EV_REPORT_PROP.FAIL_REASON];
    const withFailDetails = failType.isActive || failReason.isActive;

    const setProp = (propName: EventReportSelectProp) => (value: string) =>
        dispatch(eventReportActions.setReportProp({ propName, value }));

    return (
        <SectionCard title="Итог">
            <div className="space-y-2">
                <WorkStatusSegments />

                {withFailDetails && (
                    <div className="ml-1 grid gap-2 border-l-2 border-destructive/40 pl-3 sm:grid-cols-2">
                        {failType.isActive && (
                            <Select
                                value={String(failType.current.id)}
                                onValueChange={setProp(EV_REPORT_PROP.FAIL_TYPE)}
                            >
                                <SelectTrigger
                                    size="sm"
                                    aria-label="Тип отказа"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Тип отказа" />
                                </SelectTrigger>
                                <SelectContent>
                                    {failType.items.map(item => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {failReason.isActive && (
                            <Select
                                value={String(failReason.current.id)}
                                onValueChange={setProp(
                                    EV_REPORT_PROP.FAIL_REASON,
                                )}
                            >
                                <SelectTrigger
                                    size="sm"
                                    aria-label="Причина отказа"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Причина отказа" />
                                </SelectTrigger>
                                <SelectContent>
                                    {failReason.items.map(item => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                )}
            </div>
        </SectionCard>
    );
};
