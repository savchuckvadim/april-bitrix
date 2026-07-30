'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { LeadsFlowNodeData } from '../../constants/types';

const TONE_CLASSES: Record<string, string> = {
    start: 'border-primary text-primary bg-card',
    done: 'border-success bg-success/15 text-success',
    junk: 'border-destructive bg-destructive/10 text-destructive',
};

type EventNode = Node<LeadsFlowNodeData, 'event'>;

/** Узел-событие BPMN: круг начала / итога / мусора. */
export const EventNode: React.FC<NodeProps<EventNode>> = ({ data }) => (
    <div
        className={`flex h-20 w-20 items-center justify-center rounded-full border-2 p-1 text-center shadow-sm ${
            TONE_CLASSES[data.tone ?? 'start']
        }`}
    >
        <Handle
            type="target"
            position={data.horizontal ? Position.Left : Position.Top}
            className="!bg-muted-foreground/60"
        />
        <p className="text-[10px] font-bold leading-tight">{data.label}</p>
        <Handle
            type="source"
            position={data.horizontal ? Position.Right : Position.Bottom}
            className="!bg-muted-foreground/60"
        />
    </div>
);
