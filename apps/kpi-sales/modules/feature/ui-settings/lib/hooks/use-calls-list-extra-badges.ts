'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { selectCallsListExtraBadges } from '../../model/ui-settings.selectors';
import { uiSettingsActions } from '../../model/ui-settings-slice';

/**
 * Бейджи, которые пользователь добавил в панель «Разборов звонков»: чтение и
 * запись. Список хранится в настройках пользователя (уходит на бэк вместе с
 * остальными UI-настройками), поэтому одинаков во всех браузерах.
 */
export const useCallsListExtraBadges = () => {
    const dispatch = useAppDispatch();
    const extraBadges = useAppSelector(selectCallsListExtraBadges);

    const setExtraBadges = useCallback(
        (ids: string[]) => {
            dispatch(uiSettingsActions.setCallsListExtraBadges(ids));
        },
        [dispatch],
    );

    return { extraBadges, setExtraBadges };
};
