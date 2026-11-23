'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import { saveComplectComposition } from '@/modules/entities/complect-variant';
import { parseComplectMode, selectComplectModeView } from '../lib/complect-mode-view';

/**
 * Выбор режима «Варианты в договоре и отчёте». Режим один на сделку
 * (composition.mode): смена на экране договора видна на экране отчёта о
 * поставке и наоборот. Запись идёт тем же thunk настроек сделки, что и раньше.
 */
export const useComplectModeSelect = () => {
    const dispatch = useAppDispatch();
    const view = useAppSelector(selectComplectModeView);

    return {
        ...view,
        setMode: (value: string) => {
            const mode = parseComplectMode(value);
            if (mode && mode !== view.mode) void dispatch(saveComplectComposition({ mode }));
        },
    };
};
