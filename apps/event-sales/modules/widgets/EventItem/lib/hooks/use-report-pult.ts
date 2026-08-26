'use client';

import { useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport';
import { EventItemResultType } from '../../model/EventItemSlice';
import { usePresentationDone } from './use-presentation-done';

export interface ReportPultView {
    /** Отмечать нечего — карточка схлопнута в пилюлю статуса. */
    isCollapsed: boolean;
    expand: () => void;
    workStatusName: string;
    isFail: boolean;
    /** Статус «Не ЦА»: селект типа обязателен, отказные селекты скрыты. */
    isNotCa: boolean;
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
export const useReportPult = (
    withNoresultSection = false,
    /** Кнопка презентации показана в карточке комментария — чип не нужен. */
    withPresentationButton = false,
): ReportPultView => {
    const [isExpanded, setIsExpanded] = useState(true);
    const report = useAppSelector(s => s.eventReport.report);
    const resultType = useAppSelector(s => s.eventItemMenu.type);
    const { isDone: isPresentationDone, isPresTask } = usePresentationDone();

    const workStatus = report[EV_REPORT_PROP.WORK_STATUS].current;
    const isFail = workStatus.code === 'fail';
    const isNotCa = workStatus.code === 'notCa';
    const isInWork = workStatus.code === 'inJob';
    const withNoresult =
        withNoresultSection || resultType === EventItemResultType.NORESULT;
    const withFail =
        report[EV_REPORT_PROP.FAIL_TYPE].isActive ||
        report[EV_REPORT_PROP.FAIL_REASON].isActive;

    const hasNothingToFill = isInWork && !withNoresult && !withFail;

    return {
        isCollapsed: hasNothingToFill && !isExpanded,
        expand: () => setIsExpanded(true),
        workStatusName: workStatus.name,
        isFail,
        isNotCa,
        isPresentationDone,
        // Чип — запасной вход к той же отметке: там, где полноценной кнопки
        // в карточке комментария нет (нерезультативное событие, ТМЦ, лид).
        // Иначе два одинаковых контрола стояли бы в одной колонке подряд.
        withPresentationChip:
            !withPresentationButton && (isPresTask || isPresentationDone),
        withNoresult,
        hasRequired: withFail || withNoresult || isNotCa,
    };
};
