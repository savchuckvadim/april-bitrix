'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { BITRIX_FLOW_SURFACE, type FlowSurface } from './flow-surface';

const FlowSurfaceContext = createContext<FlowSurface>(BITRIX_FLOW_SURFACE);

/** Без провайдера — поверхность фрейма: она основная и ничего не меняет. */
export const FlowSurfaceProvider = ({
    surface,
    children,
}: {
    surface: FlowSurface;
    children: ReactNode;
}) => (
    <FlowSurfaceContext.Provider value={surface}>
        {children}
    </FlowSurfaceContext.Provider>
);

export const useFlowSurface = (): FlowSurface => useContext(FlowSurfaceContext);
