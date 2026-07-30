import React from 'react';

interface FlowSkeletonProps {
    height: number;
}

/** Скелетон канвас-схемы на время ленивой загрузки React Flow. */
export const FlowSkeleton: React.FC<FlowSkeletonProps> = ({ height }) => (
    <div
        className="animate-pulse rounded-xl border bg-muted/30"
        style={{ height }}
        aria-hidden
    />
);
