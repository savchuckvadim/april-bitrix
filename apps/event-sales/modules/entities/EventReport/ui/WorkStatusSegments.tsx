'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getIsWithoutCompany } from '@/modules/app/lib/utills/app-state-util';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { eventReportActions } from '../model/EventReportSlice';
import { EV_REPORT_PROP } from '../type/event-report-type';
import { getCurrentWorkStatusItems } from '../lib/work-status-util';
import { getWorkStatusView } from '../lib/work-status-view';

/**
 * Статус работы сегментами вместо селекта.
 *
 * Значений три-четыре, и это главный выбор всего отчёта — прятать их под
 * выпадающий список значило платить лишним кликом за самое частое действие
 * на экране. Сегменты показывают все варианты сразу и ставятся одним тапом.
 *
 * Набор берётся из `getCurrentWorkStatusItems`: в ТМЦ-режиме «Продажи» нет, а
 * «Отложено» показывается только когда оно уже выбрано. Захардкодить четвёрку
 * здесь значило бы разъехаться с этой логикой.
 */
export const WorkStatusSegments: FC = () => {
    const dispatch = useAppDispatch();
    const report = useAppSelector(s => s.eventReport.report);
    const departmentMode = useAppSelector(
        s => s.department[DEPARTAMENT_STATE_PROP.MODE].current,
    );
    // Без компании «Продажу» не показываем вовсе: отправить её нельзя.
    const isWithoutCompany = useAppSelector(getIsWithoutCompany);

    const items = getCurrentWorkStatusItems(
        report,
        departmentMode?.code ?? 'sales',
        isWithoutCompany,
    );
    const currentId = report[EV_REPORT_PROP.WORK_STATUS].current.id;

    return (
        <div
            role="radiogroup"
            aria-label="Статус работы"
            className="flex w-1/2  flex-wrap gap-1 rounded-md bg-muted p-1"
        >
            {items.map(item => {
                const isCurrent = item.id === currentId;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={isCurrent}
                        onClick={() =>
                            dispatch(
                                eventReportActions.setReportProp({
                                    propName: EV_REPORT_PROP.WORK_STATUS,
                                    value: String(item.id),
                                }),
                            )
                        }
                        className={cn(
                            'min-w-0 flex-1 rounded-sm px-2 py-1.5 text-sm whitespace-nowrap transition-colors',
                            isCurrent
                                ? getWorkStatusView(item.code).activeClass
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {item.name}
                    </button>
                );
            })}
        </div>
    );
};
