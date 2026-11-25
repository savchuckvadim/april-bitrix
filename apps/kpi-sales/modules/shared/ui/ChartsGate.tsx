'use client';

import type { ReactElement, ReactNode } from 'react';
import { useChartsVisible } from '../lib/charts-visibility/charts-visibility.context';

interface ChartsGateProps {
    /** График вместе со своим заголовком, карточкой, легендой и переключателями. */
    children: ReactNode;
    /** Что показать, когда графики скрыты; по умолчанию — ничего. */
    fallback?: ReactNode;
}

/**
 * Показывает график только когда графики включены (настройка портала) и экран
 * не телефон. Оборачивайте блок целиком: иначе останутся пустые карточки и
 * заголовки без содержимого.
 */
export const ChartsGate = ({ children, fallback = null }: ChartsGateProps): ReactElement => {
    const visible = useChartsVisible();
    return <>{visible ? children : fallback}</>;
};
