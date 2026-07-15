'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
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
    eventReportActions,
    getCurrentWorkStatusItems,
} from '@/modules/entities/EventReport';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';

/**
 * Отчёт: статус работы; при «Отказе» — тип отказа; при типе «Отказ» — причина.
 * Каскады активности полей — в applyReportProp (entity), тут только рендер.
 */
export const ReportSection: FC = () => {
    const dispatch = useAppDispatch();
    const report = useAppSelector(s => s.eventReport.report);
    const departmentMode = useAppSelector(
        s => s.department[DEPARTAMENT_STATE_PROP.MODE].current,
    );

    const workStatusItems = getCurrentWorkStatusItems(
        report,
        departmentMode?.code ?? 'sales',
    );
    const workStatus = report[EV_REPORT_PROP.WORK_STATUS];
    const failType = report[EV_REPORT_PROP.FAIL_TYPE];
    const failReason = report[EV_REPORT_PROP.FAIL_REASON];

    const setProp = (propName: EV_REPORT_PROP) => (value: string) =>
        dispatch(eventReportActions.setReportProp({ propName, value }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Отчёт</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1.5">
                    <Label>Статус работы</Label>
                    <Select
                        value={String(workStatus.current.id)}
                        onValueChange={setProp(EV_REPORT_PROP.WORK_STATUS)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {workStatusItems.map(item => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {failType.isActive && (
                    <div className="space-y-1.5">
                        <Label>Тип отказа</Label>
                        <Select
                            value={String(failType.current.id)}
                            onValueChange={setProp(EV_REPORT_PROP.FAIL_TYPE)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {failType.items.map(item => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {failReason.isActive && (
                    <div className="space-y-1.5">
                        <Label>Причина отказа</Label>
                        <Select
                            value={String(failReason.current.id)}
                            onValueChange={setProp(EV_REPORT_PROP.FAIL_REASON)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {failReason.items.map(item => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
