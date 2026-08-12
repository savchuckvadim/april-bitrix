'use client';

import { useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport';
import { PresentationProp } from '@/modules/entities/EventPresentation';
import { EventItemResultType } from '../../model/EventItemSlice';

export interface ReportPultView {
    /** Отмечать нечего — карточка схлопнута в пилюлю статуса. */
    isCollapsed: boolean;
    expand: () => void;
    workStatusName: string;
    isFail: boolean;
    isPresentationDone: boolean;
    withPresentationChip: boolean;
    withNoresult: boolean;
    /** В пульте есть незаполненное обязательное поле. */
    hasRequired: boolean;
}

/**
 * Состояние пульта отчёта: что показывать и можно ли свернуть.
 *
 * Свернуть можно ровно тогда, когда отмечать нечего: статус «в работе»
 * (самый частый случай), нет причин недозвона и отказа. Как только
 * появляется хоть одно поле — карточка раскрывается сама и больше не
 * схлопывается, пока менеджер не вернёт статус.
 */
export const useReportPult = (withNoresultSection = false): ReportPultView => {
    const [isExpanded, setIsExpanded] = useState(false);
    const report = useAppSelector(s => s.eventReport.report);
    const resultType = useAppSelector(s => s.eventItemMenu.type);
    const presentation = useAppSelector(s => s.eventPresentation);
    const currentTask = useAppSelector(s => s.eventTask.current);

    const workStatus = report[EV_REPORT_PROP.WORK_STATUS].current;
    const isFail = workStatus.code === 'fail';
    const isInWork = workStatus.code === 'inJob';
    const withNoresult =
        withNoresultSection || resultType === EventItemResultType.NORESULT;
    const withFail =
        report[EV_REPORT_PROP.FAIL_TYPE].isActive ||
        report[EV_REPORT_PROP.FAIL_REASON].isActive;

    const isPresTask = currentTask?.eventType === 'presentation';
    const isPresentationDone = Boolean(
        presentation[
            isPresTask
                ? PresentationProp.IS_PRESENTATION_DONE
                : PresentationProp.IS_UNPLANNED_PRESENTATION
        ],
    );

    const hasNothingToFill = isInWork && !withNoresult && !withFail;

    return {
        isCollapsed: hasNothingToFill && !isExpanded,
        expand: () => setIsExpanded(true),
        workStatusName: workStatus.name,
        isFail,
        isPresentationDone,
        // Дубль отметки презентации: она и в шапке, но там её ищут глазами,
        // а здесь она рядом со статусом — там, где отмечают итог.
        withPresentationChip: isPresTask || isPresentationDone,
        withNoresult,
        hasRequired: withFail || withNoresult,
    };
};
