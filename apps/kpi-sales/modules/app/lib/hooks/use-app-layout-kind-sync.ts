'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { appActions } from '../../model/AppSlice';
import { appLayoutKind } from '../layout/app-layout-kind';
import { useAppDispatch } from './redux';

/**
 * Каркас открытой страницы → стор (app.layoutKind). По нему цепочка
 * загрузки отчёта не запускается на «Разборах звонков» и доводится при
 * переходе в отчёт. Эффект App срабатывает при первом показе — раньше,
 * чем инициализация приложения успеет загрузить структуру отделов.
 */
export const useAppLayoutKindSync = (): void => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();

    useEffect(() => {
        dispatch(appActions.setLayoutKind(appLayoutKind(pathname)));
    }, [dispatch, pathname]);
};
