'use client';

import { useAppSelector } from './redux';
import { selectAppPlacement, selectIsSmallDisplay } from '../../model/selectors';

/**
 * Вкладка карточки CRM («маленький экран») и из какой карточки открыт
 * конструктор: шапке и каркасу этого достаточно.
 */
export const useSmallDisplay = () => {
    const isSmall = useAppSelector(selectIsSmallDisplay);
    const placement = useAppSelector(selectAppPlacement);
    return { isSmall, openedFrom: placement?.entity ?? null };
};
