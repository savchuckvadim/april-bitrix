'use client';

import { FC } from 'react';
import { MicroSegmented } from '@workspace/april-ui';
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
        <MicroSegmented
            ariaLabel="Статус работы"
            value={String(currentId)}
            options={items.map(item => ({
                value: String(item.id),
                label: item.name,
                // Свой цвет у каждого статуса: «Отказ» не должен выглядеть
                // так же нейтрально, как «В работе».
                activeClass: getWorkStatusView(item.code).activeClass,
            }))}
            onChange={value =>
                dispatch(
                    eventReportActions.setReportProp({
                        propName: EV_REPORT_PROP.WORK_STATUS,
                        value,
                    }),
                )
            }
        />
    );
};
