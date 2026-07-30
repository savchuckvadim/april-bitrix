'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ProcessFlowProps } from './ProcessFlow';
import { FlowSkeleton } from './FlowSkeleton';

/** Ленивый канвас: React Flow грузится только на страницах со схемами. */
export const ProcessFlowLazy = dynamic<ProcessFlowProps>(
    () => import('./ProcessFlow').then((module) => module.ProcessFlow),
    { ssr: false, loading: () => <FlowSkeleton height={480} /> },
);
