'use client';

import type { ReactNode } from 'react';
import { useFlowLayout } from '../hooks/use-flow-layout';
import { FlowNav } from './FlowNav';

/** Рамка шагов сборки: цвет комплекта + степпер над экраном шага. */
export const FlowLayout = ({ children }: { children: ReactNode }) => {
    const flow = useFlowLayout();

    return (
        <div
            data-complect={flow.complectAttr}
            style={flow.complectStyle}
            className="flex flex-1 flex-col"
        >
            <FlowNav />
            <div className="flex flex-1 flex-col">{children}</div>
        </div>
    );
};
