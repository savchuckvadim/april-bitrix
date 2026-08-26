'use client';

import { useEffect, useRef, useState } from 'react';

/** Сколько всплывашка видна после появления, мс. */
const AUTO_HIDE_MS = 6000;
/** Задержка скрытия после ухода курсора с маркера, мс. */
const HOVER_LEAVE_MS = 300;

export interface WarningHintView {
    /** Показать карточку с предупреждениями. */
    visible: boolean;
    /** Прибита кликом — автоскрытие выключено. */
    pinned: boolean;
    markerProps: {
        onMouseEnter: () => void;
        onMouseLeave: () => void;
        onFocus: () => void;
        onBlur: () => void;
        onClick: () => void;
    };
}

/**
 * Стейт-машина всплывашки предупреждений у названия сущности (todo2508 №6):
 * появляется сама при новом наборе предупреждений (смена клиента, пропала
 * компания), уходит через AUTO_HIDE_MS; после ухода информация НЕ теряется —
 * ховер/фокус на маркере показывает её снова, клик прибивает (тач-устройства,
 * где ховера нет).
 */
export const useWarningHint = (warningIds: string[]): WarningHintView => {
    const signature = warningIds.join(',');
    const [visible, setVisible] = useState(false);
    const [pinned, setPinned] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = () => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
    };
    const hideLater = (delay: number) => {
        clearTimer();
        hideTimer.current = setTimeout(() => setVisible(false), delay);
    };

    // Новый набор предупреждений → показать и завести автоскрытие.
    // Пустая сигнатура — скрыть немедленно (предупреждения закрыли делом).
    useEffect(() => {
        setPinned(false);
        if (!signature) {
            clearTimer();
            setVisible(false);
            return;
        }
        setVisible(true);
        hideLater(AUTO_HIDE_MS);
        return clearTimer;
    }, [signature]);

    return {
        visible,
        pinned,
        markerProps: {
            onMouseEnter: () => {
                clearTimer();
                setVisible(true);
            },
            onMouseLeave: () => {
                if (!pinned) hideLater(HOVER_LEAVE_MS);
            },
            onFocus: () => {
                clearTimer();
                setVisible(true);
            },
            onBlur: () => {
                if (!pinned) hideLater(HOVER_LEAVE_MS);
            },
            onClick: () => {
                setPinned(prev => {
                    const next = !prev;
                    clearTimer();
                    setVisible(next);
                    return next;
                });
            },
        },
    };
};
