'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ProcessFlowProps } from './ProcessFlow';
import { FlowEditorProps } from './editor/FlowEditor';
import { FlowSkeleton } from './FlowSkeleton';

/** Ленивый канвас: React Flow грузится только на страницах со схемами. */
export const ProcessFlowLazy = dynamic<ProcessFlowProps>(
    () => import('./ProcessFlow').then((module) => module.ProcessFlow),
    { ssr: false, loading: () => <FlowSkeleton height={480} /> },
);

/** Ленивый редактор: грузится только когда клиент открыл свой вариант. */
export const FlowEditorLazy = dynamic<FlowEditorProps>(
    () => import('./editor/FlowEditor').then((module) => module.FlowEditor),
    { ssr: false, loading: () => <FlowSkeleton height={480} /> },
);
