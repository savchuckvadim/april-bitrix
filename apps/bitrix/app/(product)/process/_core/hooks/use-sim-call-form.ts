'use client';

import { useMemo, useState } from 'react';
import {
    findDeadline,
    findEventType,
    isSetAsideDeadline,
    visibleWorkStatuses,
} from '../constants/sim-events';
import type { SimReport } from '../lib/simulator.util';

/**
 * Состояние и валидация формы «Звонки».
 *
 * Правила проверки взяты из реальной отправки (`send-validation.ts`), а не
 * придуманы: комментарий обязателен всегда; название и тип планируемого
 * события — когда планирование включено; тип отказа и возражение — когда
 * менеджер закрывает клиента отказом.
 *
 * Тонкость, которую стоит знать: на бэкенде эти поля объявлены обязательными
 * БЕЗУСЛОВНО, а условной их делает именно фронт — он всегда шлёт значение по
 * умолчанию. Форма здесь повторяет поведение фронта.
 */
export const useSimCallForm = (reportedEventCode: string | null) => {
    const reported = findEventType(reportedEventCode ?? '');

    const [result, setResult] = useState<'result' | 'noresult'>('result');
    const [noresultReason, setNoresultReason] = useState('nopickup');
    const [workStatus, setWorkStatus] = useState('inJob');
    const [failType, setFailType] = useState('failure');
    const [failReason, setFailReason] = useState('noneed');
    const [presentationDone, setPresentationDone] = useState(false);
    const [comment, setComment] = useState('');
    const [reportContact, setReportContact] = useState<string | null>('c1');

    const [isPlanning, setIsPlanning] = useState(true);
    const [nextEventCode, setNextEventCode] = useState('warm');
    const [planTitle, setPlanTitle] = useState('');
    const [planDeadline, setPlanDeadline] = useState('tomorrow');
    const [planContact, setPlanContact] = useState<string | null>('c3');

    const [showErrors, setShowErrors] = useState(false);

    const isResult = result === 'result';
    const isFail = workStatus === 'fail';
    const isSale = workStatus === 'success';
    /**
     * «Отложено» не выбирают — оно наступает само, когда следующее событие
     * назначено слишком далеко. Менеджер держит в руках дату, а не статус.
     */
    const isSetAside =
        workStatus === 'inJob' && isSetAsideDeadline(planDeadline);
    const effectiveWorkStatus = isSetAside ? 'setAside' : workStatus;
    const isFinishing = isSale || isFail;
    const planned = findEventType(nextEventCode);
    /** Планировать после продажи и отказа нечего: сделка закрывается. */
    const planningActive = isPlanning && !isFinishing;

    const errors = useMemo(() => {
        const found: Record<string, string> = {};

        if (!comment.trim()) found.comment = 'Напишите комментарий';
        if (planningActive && !planTitle.trim()) {
            found.planTitle = 'Назовите следующее событие';
        }
        if (planningActive && !planDeadline) {
            found.planDeadline = 'Поставьте срок';
        }
        if (isFail && !failType) found.failType = 'Выберите тип отказа';
        if (isFail && !failReason) found.failReason = 'Выберите возражение';

        return found;
    }, [
        comment,
        planningActive,
        planTitle,
        planDeadline,
        isFail,
        failType,
        failReason,
    ]);

    const buildReport = (): SimReport => ({
        result,
        noresultReason: isResult ? undefined : noresultReason,
        comment: comment.trim(),
        workStatus: effectiveWorkStatus,
        failType: isFail ? failType : undefined,
        failReason: isFail ? failReason : undefined,
        presentationDone: isResult && presentationDone,
        reportContactId: reportContact,
        nextEventCode: planningActive ? nextEventCode : null,
        planTitle: planningActive ? planTitle.trim() : undefined,
        planDeadline: planningActive
            ? findDeadline(planDeadline)?.label
            : undefined,
        planContactId: planningActive ? planContact : null,
    });

    const submit = (onSubmit: (report: SimReport) => void) => {
        if (Object.keys(errors).length > 0) {
            setShowErrors(true);
            return;
        }
        onSubmit(buildReport());
    };

    return {
        reported,
        planned,
        result,
        setResult,
        noresultReason,
        setNoresultReason,
        workStatus,
        setWorkStatus,
        failType,
        setFailType,
        failReason,
        setFailReason,
        presentationDone,
        setPresentationDone,
        comment,
        setComment,
        reportContact,
        setReportContact,
        isPlanning,
        setIsPlanning,
        nextEventCode,
        setNextEventCode,
        planTitle,
        setPlanTitle,
        planDeadline,
        setPlanDeadline,
        planContact,
        setPlanContact,
        isResult,
        isFail,
        isSetAside,
        effectiveWorkStatus,
        workStatusItems: visibleWorkStatuses(isSetAside),
        isFinishing,
        planningActive,
        errors,
        showErrors,
        submit,
    };
};
