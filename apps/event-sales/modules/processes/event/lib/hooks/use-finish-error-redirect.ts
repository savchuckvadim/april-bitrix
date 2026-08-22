'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    getFinishTarget,
    useCurrentRelations,
    useOpenEntityCard,
} from '@/modules/entities/RelatedCrm';

/** Сколько секунд даём прочитать ошибку, прежде чем уводить в CRM. */
const REDIRECT_DELAY_SECONDS = 5;

export interface FinishErrorRedirect {
    /** Осталось секунд до перехода; `null` — переход не запланирован. */
    secondsLeft: number | null;
    /** Отменить переход и остаться на экране. */
    cancel: () => void;
    /** Перейти прямо сейчас. */
    goNow: () => void;
}

/**
 * После неудачной отправки уводим менеджера в карточку CRM.
 *
 * Экран с ошибкой — тупик: починить отсюда нечего, а разбираться надо в самой
 * сделке. Поэтому показываем ошибку несколько секунд и открываем карточку.
 *
 * Обратный отсчёт видимый и отменяемый: молча уводить человека с экрана,
 * который он читает, нельзя — а он может как раз собираться нажать «Повторить».
 * Любое его действие отменяет переход.
 *
 * Связи не запрашиваются отдельно: они уже в сторе (их грузит листенер для
 * шапки-layout), цель перехода обычно готова мгновенно.
 */
export const useFinishErrorRedirect = (
    isError: boolean,
): FinishErrorRedirect => {
    const { descriptor, details } = useCurrentRelations();
    const openEntityCard = useOpenEntityCard();

    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [isCancelled, setIsCancelled] = useState(false);

    // Мемо обязательно: без него цель — новый объект на каждый рендер, и
    // эффект отсчёта перезапускался бы бесконечно, обнуляя таймер.
    const target = useMemo(
        () => getFinishTarget({ descriptor, details: details ?? null }),
        [descriptor, details],
    );

    const goNow = useCallback(() => {
        setSecondsLeft(null);
        if (target) void openEntityCard(target.entityType, target.entityId);
    }, [openEntityCard, target]);

    const cancel = useCallback(() => {
        setIsCancelled(true);
        setSecondsLeft(null);
    }, []);

    // Отсчёт стартует только когда есть куда вести: обещать переход и никуда
    // не перейти хуже, чем не обещать.
    useEffect(() => {
        if (!isError || isCancelled || !target) {
            setSecondsLeft(null);
            return;
        }

        setSecondsLeft(REDIRECT_DELAY_SECONDS);
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isError, isCancelled, target]);

    // Переход — отдельным эффектом: дёргать навигацию из тика таймера значит
    // делать это внутри setState, а туда побочным эффектам ходу нет.
    useEffect(() => {
        if (secondsLeft !== 0 || !target) return;
        void openEntityCard(target.entityType, target.entityId);
    }, [secondsLeft, target, openEntityCard]);

    return { secondsLeft, cancel, goNow };
};
