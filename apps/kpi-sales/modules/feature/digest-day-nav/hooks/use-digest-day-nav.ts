'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    digestActions,
    formatDigestDay,
    isFutureIso,
    isTodayIso,
    parseIsoDay,
    todayIso,
    toIsoDay,
} from '@/modules/entities/digest';

/**
 * Навигация по дням дайджеста: день в слайсе, подпись, запрет будущего
 * (событий там нет), выбор в календаре.
 */
export const useDigestDayNav = () => {
    const dispatch = useAppDispatch();
    const date = useAppSelector(state => state.digest.date);
    const [open, setOpen] = useState(false);

    const isToday = isTodayIso(date);
    const canForward = !isToday && !isFutureIso(date);

    const goPrev = () => dispatch(digestActions.shiftDay(-1));
    const goNext = () => {
        if (canForward) dispatch(digestActions.shiftDay(1));
    };
    const goToday = () => dispatch(digestActions.setDate(todayIso()));
    const pick = (picked?: Date) => {
        if (!picked) return;
        const iso = toIsoDay(picked);
        if (!isFutureIso(iso)) dispatch(digestActions.setDate(iso));
        setOpen(false);
    };

    return {
        date,
        label: formatDigestDay(date),
        isToday,
        canForward,
        selected: parseIsoDay(date) ?? undefined,
        open,
        setOpen,
        goPrev,
        goNext,
        goToday,
        pick,
    };
};
