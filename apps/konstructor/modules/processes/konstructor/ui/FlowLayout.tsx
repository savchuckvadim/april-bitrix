'use client';

import type { ReactNode } from 'react';
import { useFlowLayout } from '../hooks/use-flow-layout';
import { FlowNav } from './FlowNav';

export interface FlowLayoutProps {
    children: ReactNode;
    /** Вкладка карточки CRM: компактный степпер (решает каркас фрейма, не стор) */
    compact?: boolean;
}

/** Рамка шагов сборки: цвет комплекта + степпер над экраном шага. */
export const FlowLayout = ({ children, compact = false }: FlowLayoutProps) => {
    const flow = useFlowLayout();

    return (
        <div
            data-complect={flow.complectAttr}
            style={flow.complectStyle}
            className="flex flex-1 flex-col"
        >
            <FlowNav compact={compact} />
            <div className="flex flex-1 flex-col">{children}</div>
        </div>
    );
};
