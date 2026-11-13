'use client';

import type { ReactNode } from 'react';
import { FlowLayout } from '@/modules/processes/konstructor';
import { useSmallDisplay } from '../lib/hooks/use-small-display';

/**
 * Шаги сборки во фрейме Битрикса: во вкладке карточки CRM степпер компактный.
 * Публичная версия подключает FlowLayout сама — о встройке она не знает.
 */
export const FrameFlowLayout = ({ children }: { children: ReactNode }) => {
    const { isSmall } = useSmallDisplay();
    return <FlowLayout compact={isSmall}>{children}</FlowLayout>;
};
